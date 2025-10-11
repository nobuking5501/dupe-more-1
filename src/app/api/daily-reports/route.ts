import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'
import { FieldValue } from 'firebase-admin/firestore'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const limit = parseInt(searchParams.get('limit') || '50')

    console.log('📝 日報取得開始 - 条件:', { startDate, endDate, limit })

    let query = adminDb
      .collection('daily_reports')
      .orderBy('reportDate', 'desc')
      .limit(limit)

    // Firestoreでは複数の範囲クエリを使う場合、複合インデックスが必要
    // ここでは単純に全件取得してフィルタリング
    const snapshot = await query.get()

    let reports = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate().toISOString()
    }))

    // クライアント側でフィルタリング
    if (startDate) {
      reports = reports.filter((r: any) => r.reportDate >= startDate)
    }

    if (endDate) {
      reports = reports.filter((r: any) => r.reportDate <= endDate)
    }

    console.log('✅ 日報取得成功:', reports.length, '件')

    return NextResponse.json({
      success: true,
      data: reports || []
    })

  } catch (error) {
    console.error('❌ API Error:', error)
    return NextResponse.json(
      { error: '内部サーバーエラー' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    console.log('📝 日報作成開始')

    const {
      staffName,
      reportDate,
      weatherTemperature,
      customerAttributes,
      visitReasonPurpose,
      treatmentDetails,
      customerBeforeTreatment,
      customerAfterTreatment,
      salonAtmosphere,
      insightsInnovations,
      kanaePersonalThoughts
    } = body

    if (!staffName || !reportDate) {
      return NextResponse.json(
        { error: 'スタッフ名と報告日は必須です' },
        { status: 400 }
      )
    }

    const reportRef = adminDb.collection('daily_reports').doc()
    await reportRef.set({
      staffName,
      reportDate,
      weatherTemperature: weatherTemperature || '',
      customerAttributes: customerAttributes || '',
      visitReasonPurpose: visitReasonPurpose || '',
      treatmentDetails: treatmentDetails || '',
      customerBeforeTreatment: customerBeforeTreatment || '',
      customerAfterTreatment: customerAfterTreatment || '',
      salonAtmosphere: salonAtmosphere || '',
      insightsInnovations: insightsInnovations || '',
      kanaePersonalThoughts: kanaePersonalThoughts || '',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    })

    const report = {
      id: reportRef.id,
      staffName,
      reportDate,
      weatherTemperature,
      customerAttributes,
      visitReasonPurpose,
      treatmentDetails,
      customerBeforeTreatment,
      customerAfterTreatment,
      salonAtmosphere,
      insightsInnovations,
      kanaePersonalThoughts,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    console.log('✅ 日報作成成功:', report.id)

    return NextResponse.json({
      success: true,
      data: report
    })

  } catch (error) {
    console.error('❌ API Error:', error)
    return NextResponse.json(
      { error: '内部サーバーエラー' },
      { status: 500 }
    )
  }
}
