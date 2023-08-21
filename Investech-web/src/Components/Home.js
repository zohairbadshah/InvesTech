import React,{useState} from "react";
import StockItem from "./StockItem";
import "../Styles/stockitem.css";
import "../Styles/home.css";
import ChartItem from "./ChartItem";
import AnalysisBar from "./AnalysisBar";

const  Home=(props)=>{
  const [activeIndex, setActiveIndex] = useState(0);
  const handleItemClick = (index) => {
    
    setActiveIndex(index);
    
  };
  const stockItems = [
    { key: "1", name: "Tata Motors", symbol: "TATAMOTORS.NS", imageUrl: "/images/tata.jpg" },
    { key: "2", name: "Steel Auth.", symbol: "SAIL.NS", imageUrl: "/images/sail.jpg" },
    { key: "3", name: "Nifty 50", symbol: "^NSEI", imageUrl: "/images/nifty (1).jpg" },
    { key: "4", name: "Adani Ent.", symbol: "ADANIENT.NS", imageUrl: "/images/adani.jpg" },
    { key: "5", name: "Bharat Pet.", symbol: "BPCL.NS", imageUrl: "/images/bpcl.jpg" },
    { key: "6", name: "Reliance", symbol: "RELIANCE.NS", imageUrl: "/images/relaince.jpg" },
  ];
  return (
    <div style={{backgroundColor:"black",height:"679px",overflow: "hidden"}}>
      <div className="stockitem-layout">
      {stockItems.map((item, index) => (
          <StockItem
            key={item.key}
            name={item.name}
            symbol={item.symbol}
            imageUrl={item.imageUrl}
            isActive={activeIndex === index}
            onClick={() => handleItemClick(index)}
            index={activeIndex}
            setProgress={props.setProgress}
          />
        ))}
      </div>
      <ChartItem index={activeIndex} setProgress={props.setProgress}/>
      {/* <AnalysisBar/> */}

    </div>
  );
}

export default Home;
