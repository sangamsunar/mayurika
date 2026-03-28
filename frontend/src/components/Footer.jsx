import logo from "../assets/nav_icons/logo.png";
function Footer(){
  return(
    <>
      <footer className="flex justify-center">
        <div className="flex-row justify-center">
          <img src = {logo} className="w-120"/>
          <p className="text-center">&copy; {new Date().getFullYear()} MAYURIKA</p>   
        </div>
      </footer>
      
    </>
  );
}

export default Footer