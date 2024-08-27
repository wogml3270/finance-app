import { useEffect, useState } from "react";

import styled from "styled-components";

export default function Home() {
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [selectedPerson, setSelectedPerson] = useState("이현동");
  const [balance, setBalance] = useState(0);

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

    const newTransactions = {
      ...transactions,
      [selectedPerson]: [
        ...(transactions[selectedPerson] || []),
        newTransaction,
      ],
    };

    setTransactions(newTransactions);
    localStorage.setItem("transactions", JSON.stringify(newTransactions)); // localStorage에 저장

    const newBalance = newTransactions[selectedPerson].reduce(
      (acc, curr) => acc + curr.amount,
      0
    );
    setBalance(newBalance);
    setAmount("");
    setDate("");
  };

  // 거래 대상 선택 시 거래 내역 및 잔액 업데이트
  const handlePersonChange = (e) => {
    const person = e.target.value;
    setSelectedPerson(person);
    const personTransactions = transactions[person] || [];
    const personBalance = personTransactions.reduce(
      (acc, curr) => acc + curr.amount,
      0
    );
    setBalance(personBalance);
  };

  return (
    <Container>
      <Title>거래 관리</Title>

      <Select value={selectedPerson} onChange={handlePersonChange}>
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
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="금액 입력"
      />
      <Button onClick={addTransaction}>거래 추가</Button>

      <Balance>현재 남은 금액: {balance}₩</Balance>

      <h3>거래 내역</h3>
      <TransactionList>
        {(transactions[selectedPerson] || []).map((transaction, index) => (
          <TransactionItem key={index} isPositive={transaction.amount > 0}>
            <span>{transaction.amount}₩</span>
            <small>{transaction.date}</small>
          </TransactionItem>
        ))}
      </TransactionList>
    </Container>
  );
}

// 스타일 컴포넌트 정의
const Container = styled.div`
  padding: 40px;
  max-width: 750px;
  margin: 20px auto;
  background-color: transparent;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  text-align: center;
  color: #333;
  font-family: "Arial", sans-serif;
  font-size: 2.5em;
  margin-bottom: 30px;
`;

const Select = styled.select`
  padding: 12px 15px;
  margin-right: 10px;
  margin-bottom: 20px;
  border: 2px solid #ddd;
  border-radius: 5px;
  font-size: 1em;
  box-sizing: border-box;

  &:focus {
    border-color: #0070f3;
    outline: none;
  }
`;

const Input = styled.input`
  padding: 12px 15px;
  margin-right: 10px;
  margin-bottom: 20px;
  border: 2px solid #ddd;
  border-radius: 5px;
  font-size: 1em;
  box-sizing: border-box;

  &:focus {
    border-color: #0070f3;
    outline: none;
  }
`;

const Button = styled.button`
  padding: 12px 20px;
  border: none;
  background-color: #0070f3;
  color: white;
  border-radius: 5px;
  font-size: 1em;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #005bb5;
  }
`;

const Balance = styled.h2`
  margin-top: 30px;
  color: #0070f3;
  font-size: 1.8em;
  text-align: center;
  font-weight: bold;
`;

const TransactionList = styled.ul`
  margin-top: 30px;
  list-style-type: none;
  padding: 0;
`;

const TransactionItem = styled.li`
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  background-color: #fff;
  border-radius: 5px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:last-child {
    border-bottom: none;
  }

  span {
    font-weight: bold;
    color: ${(props) => (props.isPositive ? "#28a745" : "#dc3545")};
  }

  small {
    color: #666;
    font-size: 0.9em;
  }
`;
