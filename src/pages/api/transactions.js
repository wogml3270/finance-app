import { supabase } from "@/utils/supabase";

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case "GET":
      return handleGet(req, res);
    case "POST":
      return handlePost(req, res);
    case "PUT":
      return handlePut(req, res);
    case "DELETE":
      return handleDelete(req, res);
    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
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

// POST: 새로운 거래 추가
async function handlePost(req, res) {
  const { person, amount, date } = req.body;

  if (!person || !amount || !date) {
    return res
      .status(400)
      .json({ error: "Person, amount, and date are required" });
  }

  const { data, error } = await supabase
    .from("transactions")
    .insert([{ person, amount, date }]);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(201).json(data[0]);
}

// PUT: 거래 수정
async function handlePut(req, res) {
  const { id, amount, date } = req.body;

  if (!id || !amount || !date) {
    return res.status(400).json({ error: "ID, amount, and date are required" });
  }

  const { data, error } = await supabase
    .from("transactions")
    .update({ amount, date })
    .eq("id", id);

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
