import styled from "styled-components";

// 스타일 컴포넌트 정의
export const Container = styled.div`
  padding: 40px;
  max-width: 750px;
  margin: 0 auto;
  background-color: transparent;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

export const Title = styled.h1`
  text-align: center;
  color: #333;
  font-family: "Arial", sans-serif;
  font-size: 2.5em;
  margin-bottom: 30px;
`;

export const Select = styled.select`
  width: 100%;
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

export const Input = styled.input`
  padding: 12px 15px;
  flex: 1;
  border: 2px solid #ddd;
  border-radius: 5px;
  font-size: 1em;
  box-sizing: border-box;

  &:focus {
    border-color: #0070f3;
    outline: none;
  }
`;

export const Button = styled.button`
  padding: 12px 20px;
  flex: 0.5;
  border: none;
  background-color: ${(props) => {
    switch (props.variant) {
      case "edit":
        return "#00b320";
      case "delete":
        return "#dc3545";
      default:
        return "#0070f3";
    }
  }};
  color: white;
  border-radius: 5px;
  font-size: 1em;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #005bb5;
  }
`;

export const ClearButton = styled.button`
  padding: 12px 20px;
  margin-top: 20px;
  border: none;
  background-color: #dc3545;
  color: white;
  border-radius: 5px;
  font-size: 1em;
  cursor: pointer;
  width: 100%;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #c82333;
  }
`;

export const Total = styled.h2`
  color: #d4ff3b;
  font-size: 1.5em;
  font-weight: bold;
  border: 2px solid #ccc;
  border-radius: 5px;
  padding: 10px;
  text-align: center;
`;

export const TransactionGuied = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;

  span {
    width: 20px;
    height: 20px;
    border-radius: 5px;

    &:nth-child(1) {
      background-color: #28a745;
    }
    &:nth-child(3) {
      background-color: #dc3545;
    }
  }

  small {
    display: flex;
    align-items: center;
    font-size: 1rem;
  }
`;

export const TransactionList = styled.ul`
  margin-top: 30px;
  list-style-type: none;
  padding: 0;
`;

export const TransactionItem = styled.li`
  padding: 10px;
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
    flex: 1;
    color: #666;
    font-size: 1.25em;
  }

  small {
    flex: 1;
    font-weight: bold;
    font-size: 1.1em;
    color: ${(props) => (props.isPositive ? "#28a745" : "#dc3545")};
  }
`;
export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const ModalContent = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  max-width: 400px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const ModalTitle = styled.h3`
  margin-bottom: 20px;
  font-size: 1.5em;
`;
