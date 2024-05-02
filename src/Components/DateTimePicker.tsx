import React from "react";
import { TextInputGroup } from "../Components/TextInputGroup";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from "moment";

const DateTimePicker: React.FC<{
  date: Date;
  onDateChange: any;
  label: string;
  style: any;
}> = ({ date, label, onDateChange, style }) => {
  const [open, setOpen] = React.useState(false);
  const [mode, setMode] = React.useState<"date" | "time" | "datetime">(
    "datetime"
  );

  React.useEffect(() => {
    setMode("datetime");
  }, []);

  const handleChangeDate = React.useCallback(
    (date: Date) => {
      onDateChange(date);
      setOpen(false);
      //   console.log("mode: ", mode, date);
      //   if (mode === "date") {
      //     setMode("time");
      //   } else {
      //     setMode("date");
      //     onDateChange(date);
      //     setOpen(false);
      //   }
    },
    [mode]
  );

  return (
    <>
      <TextInputGroup
        label={label}
        placeholder={label}
        onTouchStart={() => setOpen(true)}
        value={moment(date).format("M/D/y h:mm a")}
        style={style}
      />
      <DateTimePickerModal
        isVisible={open}
        mode={mode}
        date={date}
        isDarkModeEnabled={true}
        onConfirm={handleChangeDate}
        onCancel={() => setOpen(false)}
      />
    </>
  );
};

export default DateTimePicker;
