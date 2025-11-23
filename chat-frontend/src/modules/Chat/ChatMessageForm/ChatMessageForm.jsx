import { useForm } from "react-hook-form";
import styles from "../Chat.module.css";

const ChatMessageForm = ({ onSubmit, socketExists, onDisconnect }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      message: "",
    },
  });

  const handleFormSubmit = (values) => {
    onSubmit(values);
    reset();
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className={styles.controlsRow}
    >
      <label className={styles.label} htmlFor="message">
        Message:
      </label>
      <input
        id="message"
        type="text"
        placeholder="Type your message"
        className={styles.input}
        {...register("message", {
          required: "Message is required",
          minLength: {
            value: 1,
            message: "Message cannot be empty",
          },
        })}
      />
      {errors.message && (
        <div style={{ color: "red", marginBottom: "4px" }}>
          {errors.message.message}
        </div>
      )}

      <button
        type="submit"
        disabled={!socketExists}
        className={`${styles.sendButton} ${
          !socketExists ? styles.sendButtonDisabled : ""
        }`}
      >
        Send
      </button>

      {socketExists && (
        <button
          type="button"
          onClick={onDisconnect}
          className={styles.leaveButton}
        >
          Leave chat
        </button>
      )}
    </form>
  );
};

export default ChatMessageForm;
