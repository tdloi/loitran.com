import { IContent } from "../interfaces";
import { FC } from "react";
import { render } from "../helpers";

interface IProps {
  content: Array<IContent>;
}

export const Content: FC<IProps> = (props: IProps) => {
  return (
    <div>
      {props.content.map((item, index) => {
        return render(item, index);
      })}
    </div>
  );
};
