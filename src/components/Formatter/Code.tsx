import Prism from "prismjs";
import { theme } from "../../theme";
// TODO: import only neccessary languages
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-python";
import "prismjs/components/prism-go";

interface IProps {
  content: string;
  language: string;
}

export default function Code(props: IProps) {
  if (props.content == null) return <div></div>;

  return (
    <pre className="snippet">
      <code
        dangerouslySetInnerHTML={{
          __html: Prism.highlight(props.content, Prism.languages[props.language], props.language),
        }}
      ></code>
      <style jsx>
        {`
          .snippet {
            border: 1px solid ${theme.bgAlt};
            margin: 0.5rem;
            padding: 1rem;
          }
        `}
      </style>
    </pre>
  );
}
