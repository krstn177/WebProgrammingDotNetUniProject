import styles from "./Landing.module.css";

export default function Landing() {

  return (
    <div className={styles.container}>
      <div className={styles.backgroundPattern}></div>
      <div className={styles.content}>
        <h1 className={styles.title}>
          This is <span className={styles.highlight}>Project X</span>
        </h1>
        <p className={styles.subtitle}>Your modern banking solution</p>
      </div>
      
      <div className={styles.floatingShapes}>
        <div className={styles.shape1}></div>
        <div className={styles.shape2}></div>
        <div className={styles.shape3}></div>
      </div>
    </div>
  );
}