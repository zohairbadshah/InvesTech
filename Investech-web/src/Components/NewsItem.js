import React from "react";

const NewsItem=(props)=> {
  
    let { title, description, imageUrl, newsUrl, author, date, source } =props;
    return (
      <div className="my-3">
        <div className="card" style={{backgroundColor:"black",boxShadow: "0 10px 40px rgba(255, 255, 255, 0.3)",borderRadius:"20px"}}>
          <span
            style={{ zIndex: 1, left: "90%" }}
            className="position-absolute top-0 translate-middle badge rounded-pill bg-danger"
          >
            {source}
            <span className="visually-hidden">unread messages</span>
          </span>
          <img src={imageUrl} className="card-img-top" alt="..." />
          <div className="card-body" style={{color:"white"}}>
            <h5 className="card-title" >{title}...</h5>
            <p className="card-text" >{description}...</p>
            <p className="card-text">
              <small className="text" >
                By {author} on {new Date(date).toGMTString()}
              </small>
            </p>

            <a href={newsUrl} target="_blank" className="btn btn-sm btn-dark">
              Read More
            </a>
          </div>
        </div>
      </div>
    );
  
}

export default NewsItem