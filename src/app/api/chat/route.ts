import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { question } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API Key is missing. Please set GEMINI_API_KEY in .env.local" },
        { status: 500 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Supabase admin client not configured" },
        { status: 500 }
      );
    }

    // Fetch data from Supabase server-side
    const [coursesRes, employeesRes, recordsRes] = await Promise.all([
      supabaseAdmin.from("courses").select("*"),
      supabaseAdmin.from("employees").select("*"),
      supabaseAdmin.from("training_records").select("*").order("date", { ascending: false }),
    ]);

    const context = {
      courses: coursesRes.data || [],
      employees: employeesRes.data || [],
      records: recordsRes.data || [],
      today: new Date().toISOString(),
    };

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const systemPrompt = `
คุณคือผู้ช่วย AI แสนน่ารัก เป็นมิตร และกระตือรือร้น ของระบบจัดการอบรมพนักงาน บริษัท วี.อาร์. คอนเทนเนอร์ 🌟
เวลาตอบคำถามให้ตอบด้วยน้ำเสียงสดใส เป็นกันเอง และสุภาพ (มีหางเสียง ครับ/ค่ะ)
พยายามใช้ Emoji ที่เหมาะสมประกอบการอธิบายให้ดูน่าอ่านและเข้าใจง่ายขึ้น ✨
ให้คำแนะนำที่กระชับ ตรงประเด็น และเป็นประโยชน์สูงสุดจากข้อมูลใน Context ที่ส่งมา

กฎเหล็ก:
1. วิเคราะห์และตอบคำถามจากข้อมูลใน Context เท่านั้น ห้ามแต่งข้อมูลขึ้นมาเองเด็ดขาด 🛑
2. ถ้าคำถามไหนไม่มีข้อมูลใน Context เลย ให้บอกอย่างสุภาพว่า "ผมยังไม่มีข้อมูลส่วนนี้นะครับ รบกวนลองถามข้อมูลเกี่ยวกับการอบรม พนักงาน หรือหลักสูตรดูได้เลยครับ! 😊"
3. พยายามจัดรูปแบบข้อความให้อ่านง่าย เช่น ใช้ Bullet points เมื่อต้องแสดงรายการ
4. ฟิลด์ที่อาจเจอ: courses (id, title, category, is_compulsory, hours, expiry_years) · employees (id, full_name, department, position) · training_records (id, emp_id, course_id, date, trainer, score)
5. ผ่าน = score >= 70 · วันหมดอายุใบรับรอง = date + expiry_years ปี (ถ้า expiry_years = 0 = ไม่หมดอายุ)

ข้อมูล Context (JSON):
${JSON.stringify(context, null, 2)}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: question,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.3,
      },
    });

    const answer = response.text;

    return NextResponse.json({ answer });
  } catch (error) {
    console.error("AI Chat Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to generate AI response: ${errorMessage}` },
      { status: 500 }
    );
  }
}
