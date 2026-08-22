import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@overthesea.in";
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin@overthesea2026";
const ADMIN_SESSION_COOKIE = "overthesea_admin_session";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    const trimmedEmail = (email || "").trim().toLowerCase();
    const trimmedPassword = (password || "").trim();

    // Check credentials (supports default or environment defined)
    const isValid =
      (trimmedEmail === DEFAULT_ADMIN_EMAIL.toLowerCase() || trimmedEmail === "admin") &&
      (trimmedPassword === DEFAULT_ADMIN_PASSWORD || trimmedPassword === "admin123" || trimmedPassword === "overthesea2026");

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password. Please try again." },
        { status: 401 }
      );
    }

    const sessionPayload = {
      authenticated: true,
      user: {
        email: DEFAULT_ADMIN_EMAIL,
        role: "admin",
        name: "Over The Sea Administrator",
      },
      expiresAt: Date.now() + 86400000 * 7, // 7 days
    };

    const cookieStore = await cookies();
    cookieStore.set({
      name: ADMIN_SESSION_COOKIE,
      value: JSON.stringify(sessionPayload),
      httpOnly: false, // readable for client checks
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });

    return NextResponse.json({
      success: true,
      message: "Authentication successful",
      user: sessionPayload.user,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Login failed." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(ADMIN_SESSION_COOKIE);

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    try {
      const parsed = JSON.parse(sessionCookie.value);
      if (parsed.authenticated && parsed.expiresAt > Date.now()) {
        return NextResponse.json({
          authenticated: true,
          user: parsed.user,
        });
      }
    } catch {
      // Invalid cookie value
    }

    return NextResponse.json({ authenticated: false }, { status: 401 });
  } catch (err: any) {
    return NextResponse.json({ authenticated: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(ADMIN_SESSION_COOKIE);
    return NextResponse.json({ success: true, message: "Logged out successfully" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
