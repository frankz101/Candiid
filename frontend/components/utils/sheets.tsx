// sheets.tsx
import { SheetDefinition, registerSheet } from "react-native-actions-sheet";
import ChangePhotoSheet from "@/components/profile/ChangePhotoSheet";

registerSheet("change-photo", ChangePhotoSheet);

declare module "react-native-actions-sheet" {
  interface Sheets {
    "change-photo": SheetDefinition;
  }
}

export {};
