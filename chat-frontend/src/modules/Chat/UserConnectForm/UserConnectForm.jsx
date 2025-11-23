import { useForm } from "react-hook-form";
import styles from "../Chat.module.css";

const UserConnectForm = ({ onSubmit }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: "",
    },
  });

  const handleFormSubmit = (values) => {
    onSubmit(values);
    reset();
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className={styles.usernameBlock}
    >
      <label className={styles.label} htmlFor="username">
        Your name:
      </label>
      <input
        id="username"
        type="text"
        placeholder="Enter username"
        className={styles.input}
        {...register("username", {
          required: "Username is required",
          minLength: {
            value: 2,
            message: "Minimum 2 characters",
          },
        })}
      />
      {errors.username && (
        <div style={{ color: "red", marginBottom: "4px" }}>
          {errors.username.message}
        </div>
      )}
      <button type="submit" className={styles.primaryButton}>
        Join chat
      </button>
    </form>
  );
};

export default UserConnectForm;
