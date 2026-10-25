import { NextResponse } from 'next/server';

// Mock DB for permit data
const mockPermits = [
  {
    id: 'PRM-2026-081',
    type: 'Trekking',
    zone: 'Annapurna Conservation Area (ACAP)',
    applicantName: 'Sarah Jenkins',
    passportNumber: 'US98127398',
    startDate: '2026-10-12',
    endDate: '2026-10-24',
    status: 'Approved',
    qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PRM-2026-081',
    cost: 50,
  },
  {
    id: 'PRM-2026-082',
    type: 'Special Restricted',
    zone: 'Upper Mustang Forbidden Kingdom Loop',
    applicantName: 'Sarah Jenkins',
    passportNumber: 'US98127398',
    startDate: '2026-10-15',
    endDate: '2026-10-25',
    status: 'Pending',
    qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PRM-2026-082',
    cost: 500,
  }
];

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: mockPermits,
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal Server Error',
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, zone, applicantName, passportNumber, startDate, endDate, cost } = body;

    if (!type || !zone || !applicantName || !passportNumber) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: type, zone, applicantName, passportNumber',
      }, { status: 400 });
    }

    const newId = `PRM-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newPermit = {
      id: newId,
      type,
      zone,
      applicantName,
      passportNumber,
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Pending',
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${newId}`,
      cost: cost || 50,
    };

    // In a real application, we would save this to a database
    // mockPermits.push(newPermit);

    return NextResponse.json({
      success: true,
      message: 'Permit application submitted successfully.',
      data: newPermit,
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal Server Error',
    }, { status: 500 });
  }
}
