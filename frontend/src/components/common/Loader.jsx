const Loader = ({ size = "medium", text = "Loading..." }) => {
  return (
    <div className="loader-container">
      <div className={`spinner spinner-${size}`}></div>
      {text && <p className="loader-text">{text}</p>}
    </div>
  );
};

export default Loader;
