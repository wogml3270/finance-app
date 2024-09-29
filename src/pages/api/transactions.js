import { supabase } from "@/utils/supabase";

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    // 각 거래자의 거래 목록 불러오기
    case "GET":
      const { data: transactions, error: fetchError } = await supabase
        .from("transactions")
        .select("*")
        .order("transaction_date", { ascending: false });
      if (fetchError)
        return res.status(400).json({ error: fetchError.message });
      return res.status(200).json(transactions);

    // 각 거래자의 거래 목록 추가
    case "POST":
      const { user_id, description, amount, transaction_date, category } =
        req.body;
      const { data: newTransaction, error: createError } = await supabase
        .from("transactions")
        .insert([{ user_id, description, amount, transaction_date, category }]);
      if (createError)
        return res.status(400).json({ error: createError.message });
      return res.status(201).json(newTransaction[0]);

    // 각 거래자의 거래 목록 수정
    case "PUT":
      const { id, ...updateData } = req.body;
      const { data: updatedTransaction, error: updateError } = await supabase
        .from("transactions")
        .update(updateData)
        .eq("id", id);
      if (updateError)
        return res.status(400).json({ error: updateError.message });
      return res.status(200).json(updatedTransaction[0]);

    // 각 거래자의 거래 목록 삭제
    case "DELETE":
      const { transactionId } = req.body;
      const { error: deleteError } = await supabase
        .from("transactions")
        .delete()
        .eq("id", transactionId);
      if (deleteError)
        return res.status(400).json({ error: deleteError.message });
      return res.status(204).end();

    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
