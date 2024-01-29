import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { Smile } from "lucide-react";
import { useTheme } from "./providers/theme-provider";

export const EmojiPicker = ({ onChange }) => {
  const { theme } = useTheme();
  return (
    <Popover>
      <PopoverTrigger>
        <Smile className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition" />
      </PopoverTrigger>
      <PopoverContent
        side="right"
        sideOffset={40}
        className="bg-transparent border-none shadow-none drop-shadow-none mb-16"
      >
        <Picker
          theme={theme}
          data={data}
          onEmojiSelect={(emoji) => onChange(emoji.native)}
        />
      </PopoverContent>
    </Popover>
  );
};
