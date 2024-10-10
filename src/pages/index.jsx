import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import axios from "axios";

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

import AddPeople from "@/components/addPeople";

export default function Home() {
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [user, setUser] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState("");
  const [balance, setBalance] = useState(0);
  const [editIndex, setEditIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 거래자 목록을 불러오는 함수
  async function fetchPeople() {
    try {
      const response = await axios.get("/api/transactions"); // 거래자 목록 불러오기
      setUser(response.data);
    } catch (error) {
      console.error("Error fetching people:", error.response?.data || error.message);
    }
  }

  // 선택한 거래자의 거래 내역을 불러오는 함수
  async function fetchTransactions(person) {
    try {
      const response = await axios.get("/api/transactions", {
        params: { person },
      });
      setTransactions(response.data);
      updateBalance(response.data);
    } catch (error) {
      console.error("Error fetching transactions:", error.response?.data || error.message);
    }
  }

  // 거래자 목록을 처음에 불러옴
  useEffect(() => {
    fetchPeople();
  }, []);

  // 거래자가 선택될 때마다 해당 거래자의 거래 내역 불러옴
  useEffect(() => {
    if (selectedPerson) {
      fetchTransactions(selectedPerson);
    }
  }, [selectedPerson]);

  // 거래 추가 또는 수정 함수
  const upsertTransaction = async () => {
    const newAmount = parseFloat(amount);

    if (!selectedPerson) {
      alert('거래자를 선택해주세요.');
      return;
    }
    if (isNaN(newAmount) || !date) {
      alert("날짜와 금액 모두 입력해야 합니다.");
      return;
    }
  
    const newTransaction = {
      id: editIndex !== null ? transactions[editIndex].id : undefined,
      person: selectedPerson,
      amount: newAmount,
      date,
    };
  
    try {
      const response = await axios.post("/api/transactions", newTransaction); // 거래 추가/수정 요청
      
      // 서버에서 성공적인 응답을 받으면 데이터가 올바른지 확인
      if (response.status !== 200 || !response.data) {
        throw new Error("서버에서 오류가 발생했습니다."); // 응답 확인
      }
  
      const updatedTransactions = editIndex !== null
        ? transactions.map((transaction, index) =>
            index === editIndex ? response.data : transaction
          )
        : [response.data, ...transactions];
  
      // 거래 내역을 최신 날짜순으로 정렬
      const sortedTransactions = updatedTransactions.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
  
      setTransactions(sortedTransactions);
      updateBalance(sortedTransactions);
      setAmount("");
      setDate("");
      setIsModalOpen(false);
      setEditIndex(null);
    } catch (error) {
      console.error("거래 추가/수정 중 오류가 발생했습니다:", error.response?.data || error.message);
      alert("거래를 처리하는 중 문제가 발생했습니다. 다시 시도해주세요.");
    }
  };
  

  // 잔액 계산 함수
  const updateBalance = (transactions) => {
    const newBalance = transactions.reduce(
      (acc, curr) => acc + curr.amount,
      0
    );
    setBalance(newBalance);
  };

  // 개별 거래 수정 모달창
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
    try {
      await axios.delete(`/api/transactions`, { params: { id } }); // 거래 삭제 요청
      const updatedTransactions = transactions.filter((_, i) => i !== index);
      setTransactions(updatedTransactions);
      updateBalance(updatedTransactions);
    } catch (error) {
      console.error("Error deleting transaction:", error.message);
    }
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
          alert("거래 내역을 초기화하는 중 문제가 발생했습니다.");
          return;
        }
        setTransactions([]); // 거래 내역 초기화
        setBalance(0); // 잔액 초기화
    }
  };
  

  // 1000단위 콤마 함수
  const formattedBalance = (value) => value.toLocaleString();

  return (
    <Container>
      <Title>거래 관리</Title>
      <AddPeople user={user} setUser={setUser} />
      <div>
        <Select
          value={selectedPerson}
          onChange={(e) => setSelectedPerson(e.target.value)}
        >
          <option value="" disabled>
            거래자 선택
          </option>
          {user.map((user) => (
            <option key={user.id} value={user.name}>
              {user.name}
            </option>
          ))}
        </Select>
      </div>

      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem" }}>
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
        <Button onClick={upsertTransaction}>
          거래 추가
        </Button>
      </div>

      <div>
        <h3>{`${selectedPerson}의 현재 남은 잔금`}</h3>
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
              <Button variant="edit" onClick={() => openEditModal(index)}>
                수정
              </Button>
              <Button variant="delete" onClick={() => deleteTransaction(index)}>
                삭제
              </Button>
            </div>
          </TransactionItem>
        ))}
      </TransactionList>

      {selectedPerson && (
        <ClearButton onClick={clearAllTransactions}>
          전체 초기화
        </ClearButton>
      )}

      {isModalOpen && (
        <ModalOverlay>
          <ModalContent>
            <ModalTitle>{selectedPerson}의 거래 내역 수정</ModalTitle>
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
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
            </div>
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
              <Button variant="edit" onClick={upsertTransaction}>
                수정 완료
              </Button>
              <Button
                variant="delete"
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
