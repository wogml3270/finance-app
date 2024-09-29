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
      const { data: newUser, error: createError } = await supabase
        .from("users")
        .insert([{ name, email }]);

      // 오류 확인
      if (createError) {
        console.error("Error creating user:", createError);
        return res.status(400).json({ error: createError.message });
      }

      // 데이터가 비어있는지 확인
      if (!newUser || newUser.length === 0) {
        return res
          .status(400)
          .json({ error: "User creation failed, no data returned." });
      }
      console.log(newUser);

      // 성공적으로 생성된 사용자 반환
      return res.status(201).json(newUser[0]);

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
