import React,{useState} from "react";
import "../Styles/stockitem.css";
const  StockItem=(props)=> {
  
  return <div  className={`stockitem-div ${props.isActive ? "clicked" : ""}`} onClick={props.onClick} >
    <div className="d-flex align-items-center ">
    <img style={{
      marginLeft:"10px",
      marginTop:"10px"
    }} src={props.imageUrl} alt="Stock Image"/>
    <div className="ml-3 mx-4">
    <div style={{
      fontWeight:600,
      fontSize:19.5,
      marginTop:"10px",
      color:"white",

    }}>{props.name}</div>
    <div style={{
      fontSize:"10px",
      fontWeight:500,
      color:"white",

      display:"flex",
      justifyContent:"center"
    }}>({props.symbol})</div>
    </div>
    </div>
    <div className="d-flex justify-content-center my-2">

    </div>
  </div>;
}

export default StockItem;
