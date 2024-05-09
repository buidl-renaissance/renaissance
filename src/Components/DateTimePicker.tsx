import React, { useImperativeHandle } from "react";
import { TextInputGroup } from "../Components/TextInputGroup";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from "moment";
import { Touchable } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";

const DateTimePicker: React.FC<{
  date: Date;
  onDateChange: any;
  label: string;
  style: any;
  ref?: any;
}> = ({ date, label, onDateChange, style, ref }) => {
  const [open, setOpen] = React.useState(false);
  const [mode, setMode] = React.useState<"date" | "time" | "datetime">(
    "datetime"
  );

  const internalInputRef = React.useRef(ref);
  useImperativeHandle(ref, () => ({
    blur: () => {
      internalInputRef?.current?.blur();
    },
  }));

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
      <TouchableOpacity onPress={() => setOpen(true)}>
        <TextInputGroup
          label={label}
          placeholder={label}
          editable={false}
          value={moment(date).format("M/D/y h:mm a")}
          style={style}
        />
      </TouchableOpacity>
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
