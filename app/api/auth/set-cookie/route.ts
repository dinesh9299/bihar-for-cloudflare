import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { token, role } = await req.json();

    const res = NextResponse.json({ success: true });

    res.cookies.set("token", token, {
      httpOnly: false,
      secure: false, // set to true in production (HTTPS)
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    res.cookies.set("role", role, {
      httpOnly: false,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (err) {
    console.error("Error setting cookie:", err);
    return NextResponse.json(
      { success: false, error: "Failed to set cookie" },
      { status: 400 }
    );
  }
}
