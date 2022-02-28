import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.js'
import './App.css';

import { useState, useEffect } from "react";
import axios from 'axios';

import { themes, ThemeContext } from './contexts/ThemeContext';

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [row, setRow] = useState('5');
  const [column, setColumn] = useState('5');
  const [isInput, setIsInput] = useState(true);
  const [isDepth, setIsDepth] = useState(true);
  const [clues, setClues] = useState([]);
  const [cluesArr, setCluesArr] = useState([]);
  const [answerArr, setAnswerArr] = useState([]);
  const [showAns, setShowAns] = useState(false);

  const handleGen = async() =>{
    const URL = `http://localhost:9001/` + row + '-' + column + '/0.5';
    const { data } = await axios.get(URL).catch((err) => console.log(err));
    if (data) {
      setClues(data.clues);
    }
    // console.log(data)
    return data
  }

  const handleSolve = async() =>{
    const type = isDepth? 'depth-first-search':'breath-first-search';
    const URL = `http://localhost:9000/` + type;
    let config = {
      numberOfRows: parseInt(row),
      numberOfCols: parseInt(column),
      clues: clues
    }; 
    if (!isInput){
      config = await handleGen();
    }
    //console.log(config);
    const { data } = await axios.post(URL, config).catch((err) => console.log(err));

    //console.log(data)
    ansToArr(data)
  }

  const searchClues = (x, y) =>{
    for (let index = 0; index < clues.length; index++) {
      if (clues[index].position.x == x && clues[index].position.y == y){
        return index
      }
    }
    return -1
  }

  const cluesToArr = () =>{
    let rowArr = [];
    for (let i = 0; i < parseInt(row); i++) {
      let colArr = []
      for (let j = 0; j < parseInt(column); j++) {
        const index = searchClues(j,i);
        if (index !== -1) {
          colArr.splice(j, 0, clues[index].size);
        }
        else {
          colArr.splice(j, 0, '');
        }          
      }
      rowArr.splice(i, 0, colArr);
    }
    setCluesArr(rowArr);
  }

  const ansToArr = (ans) =>{
    let rowArr = [];
    for (let i = 0; i < parseInt(row); i++) {
      let colArr = []
      for (let j = 0; j < parseInt(column); j++) {
        colArr.splice(j, 0, '');        
      }
      rowArr.splice(i, 0, colArr);
    }

    for (let index = 0; index < ans.length; index++) {
      for (let i = ans[index].topLeft.x; i <= ans[index].bottomRight.x; i++) {
        for (let j = ans[index].topLeft.y; j <= ans[index].bottomRight.y; j++) {
          rowArr[j][i] = index
        }
      }
    }

    //console.log(rowArr);
    setAnswerArr(rowArr);
    setShowAns(true);
  }

  const setXY = (e, x, y) =>{
    let copyClues = clues;
    const i = searchClues(x, y);
    if (e.target.value !== '') {
      if (i !== -1){
        copyClues[i].size = parseInt(e.target.value)
      }
      else {
        copyClues[clues.length] = {
        position: {
          x: x,
          y: y
        },
        size: parseInt(e.target.value)
        }
      }
    }
    else {
      let valueToRemove = [copyClues[i]];
      copyClues = copyClues.filter(e=>!valueToRemove.includes(e))
    }
    // console.log(copyClues);
    setClues(copyClues);
    cluesToArr();
  }

  const handleClear = () =>{
    setClues([]);
    setShowAns(false);
    setAnswerArr([]);
  }

  const renderTable = () =>{
    return(
      <table className={darkMode? 'table-dark':'table-light'}>
      {
        cluesArr.map((item, y)=>{
          if (y === 0) {
            return(
            <thead key={y}>
              <tr>
                {
                  item.map((val, x)=>{
                    return(
                      <th key={x} className={darkMode? showAns?'th-dark ans' + answerArr[y][x]:'th-dark':showAns?'th-light ans' + answerArr[y][x]:'th-light'}><input type='number' className='input-shikaku' value={cluesArr[y][x]} onChange={(e)=>setXY(e, x, y)} disabled={!isInput}></input></th>
                    )
                  })
                }
              </tr>
            </thead>
            )
          }
          else {
            return(
            <tbody key={y}>
              <tr>
                {
                  item.map((val, x)=>{
                    return(
                      <td key={x} className={darkMode? showAns?'td-dark ans' + answerArr[y][x]:'td-dark':showAns?'td-light ans' + answerArr[y][x]:'td-light'}><input type='number' className='input-shikaku' value={cluesArr[y][x]} onChange={(e)=>setXY(e, x, y)} disabled={!isInput}></input></td>
                    )
                  })
                }
              </tr>
            </tbody>
            )
          }
        })
      }
    </table>
    )
  }

  useEffect(() => {
    cluesToArr();
  }, [clues, row, column]);

  return (
    <div className="App">
      <div className='newNavbar'>
          <h3 className='mt-2 ms-2'><a href=''>SHIKAKU</a></h3>
          <div className='ms-2'>
            <ThemeContext.Consumer>
                  {({ changeTheme }) => (
                  <button className='darkModeSwitch'
                    onClick={() => {
                      setDarkMode(!darkMode);
                      changeTheme(darkMode ? themes.light : themes.dark);
                    }}
                  >
                    <i className={darkMode ? 'fas fa-sun' : 'fas fa-moon'}></i>
                  </button>
                  )}
              </ThemeContext.Consumer>
          </div>
      </div>
      <div className="App-header">
        <div className="input-group mb-3">
          <span className={darkMode? "input-group-text-d": "input-group-text-l"}>Rows</span>
          <input type="number" className={darkMode? "form-control-d":"form-control-l"} value={row} onChange={(e)=>setRow(e.target.value)}/>
          <span className={darkMode? "input-group-text-d": "input-group-text-l"}>Columns</span>
          <input type="number" className={darkMode? "form-control-d":"form-control-l"} value={column} onChange={(e)=>setColumn(e.target.value)}/>
        </div>
        {renderTable()}
        <div className="input-group-b mt-3">
          <button className={darkMode? "input-group-text-d brNoRadius": "input-group-text-l brNoRadius"} disabled={isInput} onClick={()=>setIsInput(!isInput)}>Input</button>
          <button className={darkMode? "input-group-text-d brNoRadius": "input-group-text-l brNoRadius"} disabled={!isInput} onClick={()=>setIsInput(!isInput)}>Generate</button>
        </div>
        <div className="input-group-b mt-3">
          <button className={darkMode? "input-group-text-d brNoRadius": "input-group-text-l brNoRadius"} disabled={isDepth} onClick={()=>setIsDepth(!isDepth)}>Depth</button>
          <button className={darkMode? "input-group-text-d brNoRadius": "input-group-text-l brNoRadius"} disabled={!isDepth} onClick={()=>setIsDepth(!isDepth)}>Breath</button>
        </div>
        <div className='input-group-c mt-3'>
          <button className={darkMode? "input-group-text-d me-1": "input-group-text-l me-1"} onClick={()=>handleClear()}>Clear</button>
          <button className={darkMode? "input-group-text-d ms-1": "input-group-text-l ms-1"} onClick={()=>handleSolve()}>{isInput?'Solve':'Generate & Solve'}</button>
        </div>
      </div>
    </div>
  );
}

export default App;
