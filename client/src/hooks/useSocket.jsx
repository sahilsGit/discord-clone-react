import { useContext } from "react";
import { SocketContext } from "@/context/Socket-Context";

const useSocket = () => useContext(SocketContext);

export default useSocket;
