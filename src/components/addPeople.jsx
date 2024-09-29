import { useEffect, useState } from "react";
import axios from "axios";
import { Button, Input } from "@/styles/styles";

export default function AddPeople() {
  const [user, setUser] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // 거래자 목록 가져오기
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("/api/users");
        setUser(response.data);
      } catch (error) {
        console.error("거래자 목록 가져오기 오류:", error);
      }
    };

    fetchUser();
  }, []);

  // 거래자 추가 함수
  const addUser = async () => {
    if (!name && !email) {
        alert("거래자 이름과 이메일을 입력해주세요.");
        return;
    }
  
    try {
        const response = await axios.post("/api/users", { name, email });
        console.log('새 거래자 추가 응답:', response.data); // 응답 데이터 로그
        setUser([...user, response.data]); // 새 거래자 추가
        setName("");
        setEmail("");
    } catch (error) {
        console.error("거래자 추가 중 오류 발생:", error);
        alert("거래자 추가 중 문제가 발생했습니다.");
    }
};
  

  return (
    <div>
      <h2>새 거래자 추가</h2>
      <Input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="새 거래자 이름"
      />
      <Input
        type='email'
        value={email} 
        onChange={(e) => setEmail(e.target.value)}
        placeholder="새 거래자 이메일"
      />
      <Button onClick={addUser}>추가</Button>
      
      <h2>거래자</h2>
      <ul>
        {user.map((list) => (
          <li key={list.id}>{list.name}</li>
        ))}
      </ul>
    </div>
  );
}
