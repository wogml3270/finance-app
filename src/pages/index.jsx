import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";

import {
  Container, 
  Title,
  Select,
  Input,
  Button,
  Total,
  TransactionGuied,
  TransactionList,
  TransactionItem,
  ClearButton,
  ModalOverlay,
  ModalContent,
  ModalTitle
} from "@/styles/styles";

export default function Home() {
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [selectedPerson, setSelectedPerson] = useState("");
  const [balance, setBalance] = useState(0);
  const [editIndex, setEditIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 거래 대상 목록
  const people = ["이현동", "이강청", "구대원"];

  // Supabase에서 거래 내역을 불러오기
  useEffect(() => {
    fetchTransactions();
  }, [selectedPerson]);

  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("person", selectedPerson)
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching transactions:", error);
    } else {
      setTransactions(data);
      const initialBalance = data.reduce(
        (acc, curr) => acc + curr.amount,
        0
      );
      setBalance(initialBalance);
    }
  };

  // 거래 추가 또는 수정 함수
  const upsertTransaction = async () => {
    const newAmount = parseFloat(amount);
    if (isNaN(newAmount) || !date) {
      alert("날짜와 금액 모두 입력해야합니다.");
      return;
    }
  
    const newTransaction = {
      id: editIndex !== null ? transactions[editIndex].id : undefined,
      person: selectedPerson,
      amount: newAmount,
      date: date,
    };
  
    try {
      const { data, error } = await supabase
        .from("transactions")
        .upsert(newTransaction, { returning: "representation" }) // upsert 사용
        .select();
  
      if (error) throw error;
      if (!data || data.length === 0) throw new Error("데이터를 가져오지 못했습니다.");
  
      const updatedTransactions = editIndex !== null
        ? transactions.map((transaction, index) =>
            index === editIndex ? data[0] : transaction
          )
        : [data[0], ...transactions];
  
      // 거래 내역을 최신 날짜순으로 정렬
      const sortedTransactions = updatedTransactions.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
  
      setTransactions(sortedTransactions);
  
      // 잔액 업데이트
      const newBalance = sortedTransactions.reduce(
        (acc, curr) => acc + curr.amount,
        0
      );
      setBalance(newBalance);
      setAmount("");
      setDate("");
      setIsModalOpen(false);
      setEditIndex(null);
    } catch (error) {
      console.error("거래 추가/수정 중 오류가 발생했습니다:", error.message);
      alert("거래를 처리하는 중 문제가 발생했습니다. 다시 시도해주세요.");
    }
  };
  
  

  // 개별 거래 수정 함수
  const openEditModal = (index) => {
    const transactionToEdit = transactions[index];
    setAmount(transactionToEdit.amount);
    setDate(transactionToEdit.date);
    setEditIndex(index);
    setIsModalOpen(true);
  };

  // 개별 거래 삭제 함수
  const deleteTransaction = async (index) => {
    const { id } = transactions[index];
    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting transaction:", error);
      return;
    }

    const updatedTransactions = transactions.filter((_, i) => i !== index);
    setTransactions(updatedTransactions);
    const newBalance = updatedTransactions.reduce(
      (acc, curr) => acc + curr.amount,
      0
    );
    setBalance(newBalance);
  };

  // 전체 거래 초기화 함수
  const clearAllTransactions = async () => {
    const confirmation = window.confirm(
      `${selectedPerson}의 거래 내역을 모두 초기화합니다. 내역은 완전히 삭제되어 복구할 수 없습니다.`
    );
    if (confirmation) {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("person", selectedPerson);

      if (error) {
        console.error("Error clearing transactions:", error);
        return;
      }

      setTransactions([]);
      setBalance(0);
    }
  };

  // 1000단위 콤마 함수
  const formattedBalance = (value) => {
    return value.toLocaleString();
  };

  return (
    <Container>
      <Title>거래 관리</Title>
      <Select
        value={selectedPerson}
        onChange={(e) => setSelectedPerson(e.target.value)}
      >
        <option value='' disabled>선택하세요</option>
        {people.map((person) => (
          <option key={person} value={person}>
            {person}
          </option>
        ))}
      </Select>
      <Input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <Input
        type="number"
        value={formattedBalance(amount)}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="금액 입력"
      />
      <Button onClick={upsertTransaction}>
        거래 추가
      </Button>
      <div>
        <h3>{selectedPerson}의 현재 남은 잔금</h3>
        <Total>{formattedBalance(balance)}₩</Total>
      </div>

      <h3>거래 내역</h3>
      <TransactionGuied>
        <span></span>
        <small>빌린 돈</small>
        <span></span>
        <small>값은 돈</small>
      </TransactionGuied>
      <TransactionList>
        {transactions.map((transaction, index) => (
          <TransactionItem key={index} isPositive={transaction.amount > 0}>
            <span>{transaction.date}</span>
            <small>{formattedBalance(transaction.amount)}₩</small>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <Button variant='edit' onClick={() => openEditModal(index)}>수정</Button>
              <Button variant='delete' onClick={() => deleteTransaction(index)}>삭제</Button>
            </div>
          </TransactionItem>
        ))}
      </TransactionList>

      <ClearButton onClick={clearAllTransactions}>전체 초기화</ClearButton>

      {isModalOpen && (
        <ModalOverlay>
          <ModalContent>
            <ModalTitle>{selectedPerson}의 거래 내역 수정</ModalTitle>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="금액 입력"
            />
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: 'flex-end' }}>
              <Button variant='edit' onClick={upsertTransaction}>수정 완료</Button>
              <Button
              variant='delete'
                onClick={() => {
                  setIsModalOpen(false);
                  setDate("");
                  setAmount("");
                }}
              >
                취소
              </Button>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
}
