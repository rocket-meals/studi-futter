export interface NicknameSheetProps {
        closeSheet: () => void;
        initialValue: string;
        onSave: (value: string) => void;
}
