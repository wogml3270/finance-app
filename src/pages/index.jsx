import { useEffect, useState } from "react";

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
  ModalTitle,
  ModalButton,
  ModalCloseButton,
} from "./styles";

export default function Home() {
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [selectedPerson, setSelectedPerson] = useState("이현동");
  const [balance, setBalance] = useState(0);
  const [editIndex, setEditIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 거래 대상 목록
  const people = ["이현동", "이강청", "구대원"];

  // 거래 내역을 localStorage에서 불러오기
  useEffect(() => {
    const savedTransactions =
      JSON.parse(localStorage.getItem("transactions")) || {};
    setTransactions(savedTransactions);
    const initialBalance =
      savedTransactions[selectedPerson]?.reduce(
        (acc, curr) => acc + curr.amount,
        0
      ) || 0;
    setBalance(initialBalance);
  }, []);

  // 거래 대상이 변경될 때 잔액 업데이트
  useEffect(() => {
    const personTransactions = transactions[selectedPerson] || [];
    const personBalance = personTransactions.reduce(
      (acc, curr) => acc + curr.amount,
      0
    );
    setBalance(personBalance);
  }, [selectedPerson, transactions]);

  // 거래 추가 함수
  const addTransaction = () => {
    const newAmount = parseFloat(amount);
    if (isNaN(newAmount) || !date) {
      alert("날짜와 금액 모두 입력해야합니다.");
      return;
    }

    const newTransaction = {
      amount: newAmount,
      date: date,
    };

    let newTransactions;
    if (editIndex !== null) {
      // 수정 모드
      newTransactions = {
        ...transactions,
        [selectedPerson]: transactions[selectedPerson]
          .map((transaction, index) =>
            index === editIndex ? newTransaction : transaction
          )
          .sort((a, b) => new Date(b.date) - new Date(a.date)),
      };
      setEditIndex(null);
    } else {
      // 추가 모드
      newTransactions = {
        ...transactions,
        [selectedPerson]: [
          ...(transactions[selectedPerson] || []),
          newTransaction,
        ].sort((a, b) => new Date(b.date) - new Date(a.date)),
      };
    }

    setTransactions(newTransactions);
    localStorage.setItem("transactions", JSON.stringify(newTransactions)); // localStorage에 저장

    const newBalance = newTransactions[selectedPerson].reduce(
      (acc, curr) => acc + curr.amount,
      0
    );
    setBalance(newBalance);
    setAmount("");
    setDate("");
    setIsModalOpen(false); // 모달 닫기
  };

  // 개별 거래 수정 함수
  const openEditModal = (index) => {
    const transactionToEdit = transactions[selectedPerson][index];
    setAmount(transactionToEdit.amount);
    setDate(transactionToEdit.date);
    setEditIndex(index);
    setIsModalOpen(true);
  };

  // 개별 거래 삭제 함수
  const deleteTransaction = (index) => {
    const newTransactions = {
      ...transactions,
      [selectedPerson]: transactions[selectedPerson].filter(
        (_, i) => i !== index
      ),
    };

    setTransactions(newTransactions);
    localStorage.setItem("transactions", JSON.stringify(newTransactions));

    const newBalance = newTransactions[selectedPerson].reduce(
      (acc, curr) => acc + curr.amount,
      0
    );
    setBalance(newBalance);
  };

  // 전체 거래 초기화 함수
  const clearAllTransactions = () => {
    const confirmation = window.confirm(
      "정말 초기화 하시겠습니까? 내역은 완전히 삭제되어 복구할 수 없습니다."
    );
    if (confirmation) {
      const newTransactions = {
        ...transactions,
        [selectedPerson]: [],
      };

      setTransactions(newTransactions);
      localStorage.setItem("transactions", JSON.stringify(newTransactions));
      setBalance(0);
    }
  };

  // 1000단위 콤마 함수
  const formattedBalance = (value) => {
    return value.toLocaleString();
  }

  return (
    <Container>
      <Title>거래 관리</Title>

      <Select
        value={selectedPerson}
        onChange={(e) => setSelectedPerson(e.target.value)}
      >
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
      <Button onClick={addTransaction}>거래 추가</Button>
      <div>
        <h3>{selectedPerson}의 현재 남은 잔금</h3>
        <Total>
          {formattedBalance(balance)}₩
        </Total>
      </div>

      <h3>거래 내역</h3>
      <TransactionGuied>
        <span></span>
        <small>빌린 돈</small>
        <span></span>
        <small>값은 돈</small>
      </TransactionGuied>
      <TransactionList>
        {(transactions[selectedPerson] || []).map((transaction, index) => (
          <TransactionItem key={index} isPositive={transaction.amount > 0}>
            <span>{transaction.date}</span>
            <small>{formattedBalance(transaction.amount)}₩</small>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <Button onClick={() => openEditModal(index)}>수정</Button>
              <Button onClick={() => deleteTransaction(index)}>삭제</Button>
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
            <div>
              <ModalButton onClick={addTransaction}>저장</ModalButton>
              <ModalCloseButton onClick={() => {
                setIsModalOpen(false);
                setDate('');
                setAmount('');
              }
              }>
                취소
              </ModalCloseButton>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
}
