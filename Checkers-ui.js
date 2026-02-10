//DOM Objects
const board=document.getElementById('board');
const buttonResign=document.getElementById('button-resign');
const buttonRestart=document.getElementById('button-restart');
const buttonDraw=document.getElementById('button-draw');
const modalContainer=document.getElementById('modal-container');
const modal=document.getElementById('modal');
const modalMessage=document.getElementById('modal-message');
const yesButton=document.getElementById('yes-button');
const noButton=document.getElementById('no-button');
const turnmessage=document.getElementById('turn-message');
turnmessage.innerHTML=`${getIsWhiteTurn()?'white':'red'} turn`;
//Global var
let victory=false;
let draw=false;
let selectedSquare=null;
let modalMission='';
const resetUiVar=()=>{
    victory=false;
    draw=false;
    selectedSquare=null;
    modalMission='';
    UpdateTurn()
}
//Create board
const CreateBoard=()=>{ 
    let squareCounter=1;
    for(let row=0;row<8;row++){
      for(let col=0;col<8;col++){
        const square=document.createElement('div');
        square.classList.add('square');
        square.id=squareCounter;
        if(row%2===0){
           square.classList.add(col%2===0?'white':'black'); 
        }
        else if(row%2!==0){
            square.classList.add(col%2===0?'black':'white');
        }
        square.addEventListener('click',(event)=>{
            if(isLock)
                return;
            if(selectedSquare===null)
                return;
                let isTargetSquareEmpty=square.children.length===0;
                let playerColor=selectedSquare.children[0].classList.contains('white')?'white':'red';
                let enemyColor="";
                let enemyID=getEnemyId(selectedSquare.id,square.id);
                let enemySquare=null;
                let isKing=selectedSquare.children[0].classList.contains('king');
                let pathId=[];
                let pathData=[];
                if(isKing){
                    pathId=getPathId(selectedSquare.id,square.id);
                if(!pathId){
                    resetSelectedSquare();
                    return;
                }
                pathData=getPathData(pathId,playerColor);
                if(!pathData){
                    resetSelectedSquare();
                    return;
                }}
                if(enemyID){
                enemySquare=document.getElementById(enemyID);
                if(enemySquare&&enemySquare.children.length>0)
                enemyColor=enemySquare.children[0].classList.contains('white')?'white':'red';
                }
                if(isMultipleCapture){
                    if(isKing){
                        if(typeof(isValidKingPath(pathId,pathData))==='number')
                            handleMove(selectedSquare.id,square.id,isKing,isTargetSquareEmpty,playerColor,enemyID,enemyColor,pathId,pathData);
                    }
                    else if(isValidCapture(selectedSquare.id,square.id,isTargetSquareEmpty,playerColor,enemyColor))
                        handleMove(selectedSquare.id,square.id,isKing,isTargetSquareEmpty,playerColor,enemyID,enemyColor,pathId,pathData);
                }else
                     handleMove(selectedSquare.id,square.id,isKing,isTargetSquareEmpty,playerColor,enemyID,enemyColor,pathId,pathData);
        })
        board.appendChild(square);
        squareCounter++;
    }
    const getPathData=(pathId,playerColor)=>{
        const pathData=[];
        if(pathId.length===0)return pathData;
        for(let i=0;i<pathId.length;i++){
            const square=document.getElementById(pathId[i]);
            let squareInfo='';
            if(square.children.length===0)
                squareInfo='empty';
            else 
                squareInfo=(square.children[0].classList.contains(playerColor))?'self':'enemy';
            pathData.push(squareInfo);
        }
        return pathData;
    }}
}//Pieces Injection
const CreatePieces=()=>{
        const squares=document.querySelectorAll('#board div');
    for(square of squares){
        const piece=document.createElement('div');
        if(parseInt(square.id)<=24&&square.classList.contains('black')){
            piece.classList.add('piece','white');
            square.appendChild(piece);
        }
        else if(parseInt(square.id)>=41&&square.classList.contains('black')){
            piece.classList.add('piece','red');
            square.appendChild(piece);
        }
        if(piece.classList.contains('piece')){
            piece.addEventListener('click',(event)=>{
                event.stopPropagation()
                if(isLock)
                    return;
                if(selectedSquare===null){
                if((getIsWhiteTurn() && event.target.classList.contains('white'))||(!getIsWhiteTurn() && event.target.classList.contains('red'))){
                event.target.parentElement.classList.add('selected');
                selectedSquare=event.target.parentElement;}}
            })
        }
    }}
    const getSquareStatus=(id)=>{
        const square=document.getElementById(id);
        if(!square) return 'out';
        if(square.children.length===0) return 'empty';
        return square.children[0].classList.contains('white')?'white':'red';
    }
     //parctical actions
const move=(fromID,toID)=>{
const piece=document.getElementById(fromID).children[0];
 const toSquare=document.getElementById(toID);
 toSquare.appendChild(piece);
}
const capture=(fromID,toID,enemyID=null)=>{
    const from=parseInt(fromID);
    const to=parseInt(toID);
    if(!enemyID)
        enemyID=(to+from)/2;
    const enemySquare=document.getElementById(enemyID);
    enemySquare.innerHTML="";
    move(fromID,toID);
}
const resetSelectedSquare=()=>{
    if(selectedSquare){
         selectedSquare.classList.remove('selected');
            selectedSquare=null;
    }   
}
const setSelectedSquare=(id)=>{
     if(selectedSquare)
         selectedSquare.classList.remove('selected');
    const newsSlectedSquare=document.getElementById(id);
            selectedSquare=newsSlectedSquare;
            selectedSquare.classList.add('selected');
}
const finishTurn=(toID)=>{
     const toSquare=document.getElementById(toID);
     if(toSquare.children.length>0){
    const piece=toSquare.children[0];
     if((piece.classList.contains('white')&&toID>56)||(piece.classList.contains('red')&&toID<9))
     piece.classList.add('king');}
    resetSelectedSquare();
    victory=isVictory();
    draw=(turnOnlyKingsMove>=30);
    if(victory||draw){
        endGame(victory,draw);
        return;
    }
   switchTurn();
   UpdateTurn();
    victory=isVictory()
    if(victory)
        endGame(victory,draw);
}
const UpdateTurn=()=>{
    turnmessage.innerHTML=`${getIsWhiteTurn()?'white':'red'} turn`;
    turnmessage.classList.remove('red','white');
    turnmessage.classList.add(getIsWhiteTurn()?'white':'red');
}
const getPlayerStatus=(color)=>{
    const squares=document.querySelectorAll('.square');
    const options=[7,9,-7,-9];
    const playerStatus={
        canCapture:[],
        canMove:false,
        numberOfPieces:0
    }
    for(let square of squares){
        if(square.children.length===0)
            continue;
        const piece=square.children[0];
        let isKing=piece.classList.contains('king');
        if(piece.classList.contains(color)){
            playerStatus.numberOfPieces++;
            if(piece.classList.contains('king')){
                if(isKingCanCaptureFromCurrentSpot(square.id,color==='white'?'red':'white')){
                    playerStatus.canCapture.push(square.id);
                    playerStatus.canMove=true;}
            }else{
                if(isManCanCaptureFromCurrentSpot(square.id,color==='white'?'red':'white')){
                    playerStatus.canCapture.push(square.id);
                      playerStatus.canMove=true;}
            }
            for(let option of options){
            let optionId=parseInt(square.id);
            optionId+=option;
            if(optionId<1||optionId>64) continue;
            console.log(optionId);
            if(isOneStepValid(parseInt(square.id),optionId,isKing,color)){
                let optionSquare=document.getElementById(optionId);
            if(optionSquare.children.length===0)
                playerStatus.canMove=true;}
            }
        }
    }
    return playerStatus;
}
const burnPieces=(squaresId)=>{
    for(let squareId of squaresId){
        const square=document.getElementById(squareId);
        if(square.children.length>0)
            square.children[0].remove();
    }
}
const endGame=(victory,draw)=>{
 isLock=true;
 yesButton.classList.add('hidden');
 noButton.innerHTML='close';
  modalContainer.classList.remove('hidden');
  modal.classList.remove('hidden');
  if(victory){
  modalMessage.innerHTML=`The Game is over! <br> The ${getIsWhiteTurn()?'white':'red'} player has won<br>`;
  }
else if(draw)
     modalMessage.innerHTML='The Game ended in a Draw';
}
//set the buttons
buttonDraw.addEventListener('click',()=>{
    modalContainer.classList.remove('hidden');
    modal.classList.remove('hidden');
    modalMessage.innerHTML=`The ${getIsWhiteTurn()?'white':'red'} player ask for draw, do you agree?`;
    modalMission='draw';
})
buttonResign.addEventListener('click',()=>{
    modalContainer.classList.remove('hidden');
    modal.classList.remove('hidden');
    modalMessage.innerHTML=`Do you want to resign and end the game?`;
    modalMission='resign';
})
noButton.addEventListener('click',(event)=>{
    event.stopPropagation();
    modalContainer.classList.add('hidden');
    modal.classList.add('hidden');
})
yesButton.addEventListener('click',(event)=>{
    event.stopPropagation();
    modalContainer.classList.add('hidden');
    modal.classList.add('hidden');
    switchTurn();
    if(modalMission==='resign')
        endGame(true,false);
    else if(modalMission==='draw')
        endGame(false,true);
})
const startGame=()=>{
    board.innerHTML='';
    CreateBoard();
    CreatePieces();
    resetLogicVar();
    resetUiVar();
}
window.addEventListener('load',startGame)
buttonRestart.addEventListener('click',startGame);

