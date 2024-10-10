import { supabase } from "@/utils/supabase";

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    // 거래자 목록 가져오기
    case "GET":
      const { data: users, error: fetchError } = await supabase
        .from("users")
        .select("*");
      if (fetchError)
        return res.status(400).json({ error: fetchError.message });
      return res.status(200).json(users);

    // 새 거래자 추가
    case "POST":
      const { name, email } = req.body;

      // 이메일 중복 확인
      const { data: existingUsers, error: fetchErrorEmail } = await supabase
        .from("users")
        .select("*")
        .eq("email", email);

      if (fetchErrorEmail) {
        return res.status(400).json({ error: fetchErrorEmail.message });
      }

      if (existingUsers.length > 0) {
        return res.status(400).json({ message: "이메일이 이미 존재합니다." });
      }

      const { data: newUser, error: insertError } = await supabase
        .from("users")
        .insert([{ name, email }])
        .select();

      if (insertError) {
        return res.status(400).json({ error: insertError.message });
      }
      return res.status(201).json(newUser);

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
