import { NextResponse } from 'next/server';

export async function POST() {
  const res = NextResponse.json({ message: 'Logout berhasil' }, { status: 200 });
  res.cookies.set('cw_session', '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
  });
  return res;
}
