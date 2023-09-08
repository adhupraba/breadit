import { FC } from "react";
import { AlertCircle } from "lucide-react";

interface IErrorMessageProps {
  status: number;
  message: string;
}

const ErrorMessage: FC<IErrorMessageProps> = ({ status, message }) => {
  return (
    <div className="flex flex-col col-span-2">
      <div className="flex gap-2 items-center text-red-500 font-medium">
        <AlertCircle className="h-5 w-5" />
        {status} | Oops! {message}
      </div>
    </div>
  );
};

export default ErrorMessage;
