import { useState } from "react";
import { suggestionPipeline } from "./transformers";
import { Text2TextGenerationOutput } from "@xenova/transformers";

const SuggestionWidget = ({ text }: { text: string }) => {
  const [suggestions, setSuggestions] = useState<
    Text2TextGenerationOutput | Text2TextGenerationOutput[]
  >([]);

  const handleSuggestions = async () => {
    const result = await suggestionPipeline(text);
    setSuggestions(result);
  };

  return (
    <div>
      <button onClick={handleSuggestions}>Get Suggestions</button>
      {suggestions.map((suggestion, idx) => (
        <p key={idx}>{suggestion.toString()}</p>
      ))}
    </div>
  );
};

export default SuggestionWidget;
