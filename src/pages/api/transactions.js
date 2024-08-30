import { supabase } from "@/utils/supabase";

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case "GET":
      return handleGet(req, res);
    case "POST":
      return handleUpsert(req, res);
    case "DELETE":
      return handleDelete(req, res);
    default:
      res.setHeader("Allow", ["GET", "POST", "DELETE"]);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}

// GET: 거래 내역 가져오기
async function handleGet(req, res) {
  const { person } = req.query;

  if (!person) {
    return res.status(400).json({ error: "Person is required" });
  }

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("person", person)
    .order("date", { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json(data);
}

// POST (upsert): 새로운 거래 추가 또는 기존 거래 수정
async function handleUpsert(req, res) {
  const { id, person, amount, date } = req.body;

  if (!person || !amount || !date) {
    return res
      .status(400)
      .json({ error: "Person, amount, and date are required" });
  }

  const upsertData = {
    person,
    amount,
    date,
  };

  if (id) {
    upsertData.id = id;
  }

  const { data, error } = await supabase
    .from("transactions")
    .upsert(upsertData, { returning: "representation" });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json(data[0]);
}

// DELETE: 거래 삭제
async function handleDelete(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "ID is required" });
  }

  const { data, error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ message: "Transaction deleted" });
}
