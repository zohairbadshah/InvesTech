import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import "../Styles/charitem.css";
import {
  Chart,
  LinearScale,
  CategoryScale,
  PointElement,
  LineElement,
  plugins,
} from "chart.js";
Chart.register(LinearScale, CategoryScale, PointElement, LineElement, plugins);

const ChartItem = (props) => {
  const down = (ctx, value) =>
    ctx.p0.parsed.y> ctx.p1.parsed.y ? value : undefined;
  const skipped = (ctx, value) => ctx.p0.skip || ctx.p1.skip ? value : undefined;
  const lastSegment = function (ctx, value) {
    if (ctx.p1DataIndex === config.data.datasets[0].data.length - 1) {
      return value;
    }
    return undefined;
  };
  const [lastFetchedDate, setLastFetchedDate] = useState("");
  const [latestPrice, setLatestPrice] = useState(0);
  const [latestChange, setLatestChange] = useState("0");
  const [historicalData, setChartData] = useState(() => {
    return {
      labels: [],
      datasets: [
        {
          label: "Stock Price",
          data: [],
          borderColor: "blue",
          backgroundColor: "rgba(0,0,0,1)",
          tension: 0,
          segment:{
            borderColor: ctx => skipped(ctx, 'rgb(0,0,255,1)')|| down(ctx, 'red') || 'rgba(0,128,0,1)',
            borderDash: ctx => skipped(ctx, [6, 6]),
          },
          spanGaps:true
          
          
        },
      ],
    };
  });
  const config = {
    type: "line",
    data: historicalData,
    
  };
  const options = {
    responsive: true,
    scales: {
      y: {
        display: true,

        beginAtZero: false,
        grid: {
          display: true,
        },
        max: historicalData.datasets[0].data.max,
        ticks: {
          stepSize: Math.abs(
            historicalData.datasets[0].data[1] -
              historicalData.datasets[0].data[1]
          ),
        },
      },
      x: {
        display: false,
        beginAtZero: false,
        grid: {
          display: true,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
        labels: {
          font: {
            size: 12,
          },
        },
      },
    },
    elements: {
      point: {
        radius: 0,
      },
  
    },
  };
  const getCollectionName = (index) => {
    switch (index) {
      case 0:
        return "TATAMOTORS.NS";
      case 1:
        return "SAIL.NS";
      case 2:
        return "^NSEI";
      case 3:
        return "ADANIENT.NS";
      case 4:
        return "BPCL.NS";
      case 5:
        return "RELIANCE.NS";
    }
  };
  const [stockPriceDataLength,setLength]=useState(0);

  const fetchInitialData = async () => {
    try {
      const collectionName = getCollectionName(props.index);
      const response = await fetch(
        `http://localhost:5000/api/fetchall/${collectionName}`
      );
      props.setProgress(10);
      props.setProgress(30);


      if (!response.ok) {
        throw new Error("Network response was not ok.");
      }
      const data = await response.json();
      props.setProgress(100);
      // setLength(data.length)
      const stockPricedDataLength=data.length;
      setLength(data.length)

      if (data[data.length - 1].price != "") {
        setLatestPrice(data[data.length - 1].price);
      }
      if (data[data.length - 1].change !== "") {
        setLatestChange(data[data.length - 1].change);
      }
      setChartData((prevData) => ({
        ...prevData,
        labels: data.map((entry) => entry.date), // Assuming "date" is a field in your MongoDB documents
        datasets: [
          {

            ...prevData.datasets[0],
            data: data.map((entry) => parseFloat(entry.price)),
            // borderColor:"rgba(0,128,0,1)"
            segment:{
              borderColor: ctx => skipped(ctx, 'rgb(0,0,255,1)')|| down(ctx, 'red') || 'rgba(0,128,0,1)',
              borderDash: ctx => skipped(ctx, [6, 6]),
            },
            spanGaps:true
            
          },
        ],
      }));
      fetchPrediction(stockPricedDataLength);
      setLastFetchedDate(data[data.length - 1].date);

    } catch (error) {
      console.error("Fetching initial data:", error);
    }
  };
  const fetchNewData = async () => {
    try {
      const collectionName = getCollectionName(props.index);
      const response = await fetch(
        `http://localhost:5000/api/fetchlatest/${collectionName}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok.");
      }
      const data = await response.json();

      if (data.price != "") {
        setLatestPrice(data.price);
      }
      if (data.change !== "") {
        setLatestChange(data.change);
      }

      if (data.date !== lastFetchedDate) {
        setChartData((prevData) => {
          const predictionDataset = prevData.datasets.find(
            (dataset) => dataset.label === "Prediction"
          );
          const liveDataset=prevData.datasets.find(
            (dataset)=>dataset.label==="Stock Price"
          );

          const newLiveDataset=[...liveDataset.data]
          if (predictionDataset) {
            const newPredictionLabel = [...prevData.labels];
            const nextMinuteIndex = newPredictionLabel.indexOf(
              "Next Minute"
            );
            if (nextMinuteIndex !== -1) {
              newLiveDataset[nextMinuteIndex] = parseFloat(data.price);
              newPredictionLabel[nextMinuteIndex]=data.date;
            }else{
              fetchPrediction(stockPriceDataLength)
            }
  
            return {
              ...prevData,
              labels:newPredictionLabel,
              datasets: [
                ...prevData.datasets.filter(
                  (dataset) => dataset.label !== "Stock Price"
                ),
                {
                  ...liveDataset,
                  data: newLiveDataset,
                },
              ],
            };
          }
          return prevData;
        });
        setLastFetchedDate((prevDate) =>
        prevDate && data.date >= prevDate ? data.date : prevDate
        );
        setLength((prev)=>prev+1);
      }
    } catch (error) {
      console.error("Fetching new data:", error);
    }
  };

  const fetchPrediction= async(stockPriceDataLength)=>{
    try{
      var collectionName=getCollectionName(props.index);
      collectionName=collectionName+'-PRED'
      const response=await fetch(
        `http://localhost:5000/api/fetchallPred/${collectionName}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok.");
      }
      const data = await response.json();
      const lead_time=60
      setChartData((prevData)=>(
        {
          ...prevData,
          labels:[...prevData.labels,...new Array(data.length + lead_time).fill("Next Minute")],
          datasets:[
            ...prevData.datasets,
            {
              label: "Prediction",
              data: new Array(stockPriceDataLength+lead_time).fill("NaN").concat(data.map((entry) => entry.price)),
              borderColor: "orange",
              backgroundColor: "rgba(0, 0, 0, 0)", // Set background color to transparent
              tension: 0,
              pointRadius: 0,
              segment:{
                borderColor: "orange",
                borderDash: ctx => skipped(ctx, [6, 6]),
              },
              spanGaps:true
              
            },
           
          ],
        }
      ));
    }catch(error){
      console.error("Fetching predictions: ", error);
    }
  };

  useEffect(() => {
    fetchInitialData();

  }, [props.index]);

  useEffect(() => {
    const interval = setInterval(fetchNewData, 10000);
    
    return () => {
      clearInterval(interval);
    };
  }, [lastFetchedDate,props.index]);
  // useEffect(()=>{
  //   const interval=setInterval(fetchPrediction(stockPriceDataLength),300000);
  //   return ()=>{
  //     clearInterval(interval);
  //   };
  // },[stockPriceDataLength])
  const collectionName = getCollectionName(props.index);
  const myStyle = {
    // flex: "1",
    borderRadius: "20px",
    textAlign: "center",
    width: "55px" /* Adjust the width and height to your preference */,
    height: "fit-content",
    border: "1px solid",
    marginRight: "40px",
    fontSize:"12px",
    marginLeft:"40px",
    marginBottom:"10px"
  };
  return (
    <div className="chartitem-div" style={{ height: "fit-content" }}>
      {/* <div
          style={{
            width: "20px",
            height: "10px",
            backgroundColor: "orange",
            marginRight: "5px",
          }}
          ></div>
        <div>Prediction</div> */}

      <div className="d-flex justify-content-space-between">
        <div style={{ flex: "1", textAlign: "start",color:"white"}}>{collectionName}</div>
        <div style={{ flex: "2", textAlign: "end",color:"white" }}>₹{latestPrice}</div>
        <div
          style={{
            marginLeft: "10px",
            borderRadius: "20px",
            width:
              "fit-content" /* Adjust the width and height to your preference */,
            height: "30px",
            border: "3px solid" /* Border width and style */,
            backgroundColor:
              latestChange !== undefined
                ? latestChange.charAt(0) === "-"
                  ? "red"
                  : "#02fa1b"
                : "blue",
            borderColor:
              latestChange !== undefined
                ? latestChange.charAt(0) === "-"
                  ? "red"
                  : "rgba(0,128,0,0)"
                : "blue",
          }}
        >
          {latestChange}
        </div>
      </div>
      <hr
        style={{
          marginLeft: "0",
          borderTop: "1px dashed rgba(0, 0, 0, 0.5)",
          width: "770px",
        }}
      ></hr>
      {/* <div className="d-flex justify-content-space-between">
        <div style={myStyle} className="click">1DAY</div>
        <div style={myStyle}>1WEEK</div>
        <div style={myStyle}>1 Month</div>
        <div style={myStyle}>1 YEAR</div>
        <div style={myStyle}>MAX</div>
      </div> */}
      <Line data={historicalData} options={options} />
    </div>
  );
};

export default ChartItem;
