import parse from "html-react-parser";
import { marked } from "marked";

function getString(content: string | Promise<string>) {
  var toReturn: string = "";

  if (typeof content === "string") {
    toReturn = content;
  } else {
    content.then((str) => {
      toReturn = str;
    });
  }

  return toReturn;
}

export default function MarkdownText({ content }: { content: string }) {
  var html_content = marked(content);

  return parse(getString(html_content));
}
