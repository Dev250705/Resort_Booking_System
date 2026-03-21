function Home() {
  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h1>Welcome Home 🎉</h1>
        <p>You are logged in successfully</p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#0f172a"
  },
  box: {
    background: "white",
    padding: "30px",
    borderRadius: "10px",
    textAlign: "center"
  }
};

export default Home;