import { useState } from "react";
import { SuggestionPipeline } from "./transformers";
import { Text2TextGenerationOutput } from "@xenova/transformers";

const SuggestionWidget = ({ text }: { text: string }) => {
  const [suggestions, setSuggestions] = useState<
    Text2TextGenerationOutput | Text2TextGenerationOutput[]
  >([]);

  const handleSuggestions = async () => {
    try {
      // const result = await suggestionPipeline(text);
      // setSuggestions(result);
      console.log("Fetching suggestions for:", text);
      const sp = await SuggestionPipeline.getInstance();
      const result = await sp(text);
      console.log("Fetched suggestions:", result);
      setSuggestions(result);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
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
