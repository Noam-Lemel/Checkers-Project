//DOM Objects
const board=document.getElementById('board');
const buttonResign=document.getElementById('button-resign');
const buttonDraw=document.getElementById('button-draw');
const modalContainer=document.getElementById('modal-container');
const modal=document.getElementById('modal');
const modalMessage=document.getElementById('modal-message');
const yesButton=document.getElementById('yes-button');
const noButton=document.getElementById('no-button');
const turnmessage=document.getElementById('turn-message');
//Global var
let isLock=false;
let victory=false;
let draw=false;
let modalMission='';
let selectedSquare=null;
let turnCount=1;
let turnOnlyKingsMove=0;
let isWhiteTurn=(turnCount%2===0);
let isMultipleCapture=false;
turnmessage.innerHTML=`${isWhiteTurn?'white':'red'} turn`;
//Create board
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
            else{
                if(isMultipleCapture){
                    if(selectedSquare.children[0].classList.contains('king')){
                        if(typeof(isValidKingPath(selectedSquare.id,square.id))==='number')
                            handleMove(selectedSquare.id,square.id);;
                    }
                    else if(isValidCapture(selectedSquare.id,square.id))
                        handleMove(selectedSquare.id,square.id);
                }else
                    handleMove(selectedSquare.id,square.id);
            }
        })
        board.appendChild(square);
        squareCounter++;
    }
}//Pieces Injection
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
                if((isWhiteTurn && event.target.classList.contains('white'))||(!isWhiteTurn && event.target.classList.contains('red'))){
                event.target.parentElement.classList.add('selected');
                selectedSquare=event.target.parentElement;}}
            })
        }
    }
//turn flow
const handleMove=(fromID,toID)=>{
    const piece=selectedSquare.children[0];
    //the king's logic
    if(piece.classList.contains('king')){
        if(isValidKingMove(fromID,toID)){
            const result=isValidKingPath(fromID,toID);
            if(result==='move'){
                const playerStatus=getPlayerStatus(isWhiteTurn?'white':'red');
                 move(fromID,toID);
                 if(playerStatus.canCapture.length>0){
                    isLock=true;
                    setTimeout(()=>{
                    move(toID,fromID)
                    setTimeout(()=>{
                    burnPieces(playerStatus.canCapture);
                    finishTurn(fromID)
                    isLock=false;
                    },500)
                },500)}
                    else{
                    turnOnlyKingsMove++;
                    finishTurn(toID);}}
            else if(result===false)
                   resetSelectedSquare();
            else{
                    capture(fromID,toID,result);
                    if(isKingCanCaptureFromCurrentSpot(toID)){
                        resetSelectedSquare();
                        const newsSlectedSquare=document.getElementById(toID);
                        selectedSquare=newsSlectedSquare;
                        selectedSquare.classList.add('selected');
                        isMultipleCapture=true;
                    }else{
                    isMultipleCapture=false;
                    finishTurn(toID);
                    turnOnlyKingsMove=0;
                }}
            }
        else
            resetSelectedSquare();
    }
    //the man's logic
    else if(isValidManMove(fromID,toID)){
            const playerStatus=getPlayerStatus(isWhiteTurn?'white':'red');
            move(fromID,toID);
            if(playerStatus.canCapture.length>0){
                isLock=true;
                setTimeout(()=>{
                    move(toID,fromID)
                    setTimeout(()=>{
                         burnPieces(playerStatus.canCapture);
                        finishTurn(fromID)
                        turnOnlyKingsMove=0;
                        isLock=false;
                    },500)
                },500)
                }else
                    finishTurn(toID);
                    turnOnlyKingsMove=0;
                }
     else if(isValidCapture(fromID,toID)){
        capture(fromID,toID);
        if(isManCanCaptureFromCurrentSpot(toID)){
           resetSelectedSquare();
            const newsSlectedSquare=document.getElementById(toID);
            selectedSquare=newsSlectedSquare;
            selectedSquare.classList.add('selected');
            isMultipleCapture=true;
        }
       else{
            isMultipleCapture=false;
            turnOnlyKingsMove=0;
            finishTurn(toID);}
     }
    else{
       resetSelectedSquare();
    }
}
const resetSelectedSquare=()=>{
    if(selectedSquare){
         selectedSquare.classList.remove('selected');
            selectedSquare=null;
    }   
}
//the man's logic
const isValidManMove=(fromID,toID)=>{
    const dif=parseInt(toID-fromID);
    const fromCol=((parseInt(fromID)-1)%8);
    const toCol=((parseInt(toID)-1)%8);
    const colDif=fromCol-toCol;
    const toSquare=document.getElementById(toID);
    const isRightDirection=isWhiteTurn?((dif===7||dif===9)):(dif===-7||dif===-9);
    if(!toSquare||toSquare.children.length!==0)
        return false;
    if(isRightDirection){
        if((colDif===1||colDif===-1))
                return true;
    }
    return false;
    }
const isValidCapture=(fromID,toID)=>{
    const from=parseInt(fromID);
    const to=parseInt(toID);
    const fromSquare=document.getElementById(fromID);
    const toSquare=document.getElementById(toID);
    if(fromSquare.children.length===0)
        return false;
    const playerColor=fromSquare.children[0].classList.contains('white')?'white':'red';
    const enemyColor=playerColor==='white'?'red':'white';
    const dif=to-from;
    if(dif!==14&&dif!==18&&dif!==-14&&dif!==-18)
        return false;
    const enemyID=(from+to)/2;
    const enemySquare=document.getElementById(enemyID);
     if(!enemySquare||enemySquare.children.length===0)
        return false;
    if(!toSquare||toSquare.children.length!==0)
        return false;

    const fromCol=(from-1)%8;
    const toCol=(to-1)%8;
    const colDif=fromCol>toCol?fromCol-toCol:toCol-fromCol;
     if(colDif!==2)
        return false; 
    if(enemySquare.children[0].classList.contains(enemyColor))
        return true;
    return false;
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
//the king's logic
const isValidKingMove=(fromID,toID)=>{
    const fromCol=((parseInt(fromID)-1)%8);
    const toCol=((parseInt(toID)-1)%8);
    const colDif=(fromCol>toCol)?(fromCol-toCol):(toCol-fromCol);
    const fromRow=parseInt((fromID-1)/8);
    const toRow=parseInt((toID-1)/8);
    const rowDif=(fromRow>toRow)?(fromRow-toRow):(toRow-fromRow);
    const toSquare=document.getElementById(toID);

    if(colDif!==rowDif)
        return false;
    if(toSquare.children.length!==0)
        return false;
    return true;
   
}
const isValidKingPath=(fromID,toID)=>{
    const fromRow=parseInt((fromID-1)/8);
    const toRow=parseInt((toID-1)/8);
    const rowDif=(fromRow>toRow)?(fromRow-toRow):(toRow-fromRow);
    const dif=parseInt(toID-fromID);
    const step=parseInt(dif/rowDif);
    let enemyPieceCounter=0;
    let enemyPiece=null;
     for(let current=parseInt(fromID)+step;(current!==parseInt(toID))&&(enemyPieceCounter<2);current+=step){
        const pathSquare=document.getElementById(current);
        if(!pathSquare) return false;
        if(pathSquare.children.length>0)
            if(pathSquare.children[0].classList.contains(isWhiteTurn?"white":"red"))
                return false;
            else{
                enemyPiece=current;
                enemyPieceCounter++;
            }
    }
    if(enemyPieceCounter===0)
        return 'move';
    else if(enemyPieceCounter>1)
        return false;
    else
        return enemyPiece;
}
//after move actions
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
    victory=isVictory()
    if(victory)
        endGame(victory,draw);
}
const switchTurn=()=>{
     turnCount++;
    isWhiteTurn=(turnCount%2===0);
    turnmessage.innerHTML=`${isWhiteTurn?'white':'red'} turn`;
    turnmessage.classList.remove('red','white');
    turnmessage.classList.add(isWhiteTurn?'white':'red');
}
const isManCanCaptureFromCurrentSpot=(fromID)=>{
    const options=[14,18,-14,-18];
    let idNumber=parseInt(fromID);
    for(let option of options){
        if((idNumber+option)>64||(idNumber+option)<0)
            continue;
        if(isValidCapture(fromID,idNumber+option))
            return true;
    }
    return false;
}
const isKingCanCaptureFromCurrentSpot=(fromID)=>{
    let idNumber=parseInt(fromID);
    const options=[7,9,-7,-9];
    for(let option of options){
        let nextId=idNumber+option;
        let fromCol=parseInt((idNumber-1)%8);
        let founedPiece=false;
        while((nextId>0)&&(nextId<=64)){
            let toCol=parseInt((nextId-1)%8);
            let colDif=(fromCol>toCol)?(fromCol-toCol):(toCol-fromCol);
            if(colDif!==1)
                break;
            const nextSquare=document.getElementById(nextId);
            const piece=nextSquare.children[0];
            if(!piece){
                if(founedPiece)
                    return true;}
            else if(piece.classList.contains(isWhiteTurn?'red':'white')){
                if(founedPiece) 
                    break;
                founedPiece=true;
            }else 
                break;
            nextId+=option;
            fromCol=toCol;
        }
    }
    return false;
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
        if(piece.classList.contains(color)){
            playerStatus.numberOfPieces++;
            if(piece.classList.contains('king')){
                if(isKingCanCaptureFromCurrentSpot(square.id)){
                    playerStatus.canCapture.push(square.id);
                    playerStatus.canMove=true;}
            }else{
                if(isManCanCaptureFromCurrentSpot(square.id)){
                    playerStatus.canCapture.push(square.id);
                      playerStatus.canMove=true;}
            }
            for(let option of options){
            let optionId=parseInt(square.id)+option;
            let optionSquare=document.getElementById(optionId);
            if(!optionSquare) continue;
            let fromCol=((parseInt(square.id)-1)%8);
            let toCol=((parseInt(optionId)-1)%8);
            let colDif=fromCol>toCol?fromCol-toCol:toCol-fromCol;
            if(colDif!==1) continue;
            if(!(piece.classList.contains('king'))&&((color==='white')?option<0:option>0))
                continue;
            if(optionSquare.children.length===0)
                playerStatus.canMove=true;
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
//end-game tests
const isVictory=()=>{
    const playerStatus=getPlayerStatus((isWhiteTurn?"red":"white"));
    if(playerStatus.numberOfPieces===0)
        return true;
    if(playerStatus.canMove===false && playerStatus.canCapture.length===0)
        return true;
    return false;
}
const endGame=(victory,draw)=>{
 isLock=true;
 const playerStatus=getPlayerStatus(isWhiteTurn?'red':'white');
 yesButton.classList.add('hidden');
 noButton.innerHTML='close';
  modalContainer.classList.remove('hidden');
  modal.classList.remove('hidden');
  if(victory){
  modalMessage.innerHTML=`The Game is over! <br> The ${isWhiteTurn?'white':'red'} player has won<br>`;
  if(playerStatus.canMove=false)
    modalMessage.innerHTML+=`the ${isWhiteTurn?'red':'white'} lost because no legal moves are possible should be displayed`
  }
else if(draw)
     modalMessage.innerHTML='The Game ended in a Draw';
}
//set the buttons
buttonDraw.addEventListener('click',()=>{
    modalContainer.classList.remove('hidden');
    modal.classList.remove('hidden');
    modalMessage.innerHTML=`The ${isWhiteTurn?'white':'red'} player ask for draw, do you agree?`;
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
    isWhiteTurn=!isWhiteTurn;
    if(modalMission==='resign')
        endGame(true,false);
    else if(modalMission==='draw')
        endGame(false,true);
})