//Global var
let isLock=false;
let turnCount=1;
let turnOnlyKingsMove=0;
let isMultipleCapture=false;
let isWhiteTurn=(turnCount%2===0);
const switchTurn=()=>{
     turnCount++;
    isWhiteTurn=(turnCount%2===0);
}
const getIsWhiteTurn=()=>{
    return isWhiteTurn;
}
const resetLogicVar=()=>{
    isLock=false;
    turnCount=1;
    turnOnlyKingsMove=0;
    isMultipleCapture=false;
    isWhiteTurn=(turnCount%2===0);
}
//turn flow
const handleMove=(fromID,toID,isKing,isTargetSquareEmpty,playerColor,enemyID,enemyColor,pathId,pathData)=>{
    //the king's logic
    if(isKing){
        if(isValidKingMove(fromID,toID,isTargetSquareEmpty)){
            const result=isValidKingPath(pathId,pathData);
            if(result==='move'){
                const playerStatus=getPlayerStatus(playerColor);
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
                    if(isKingCanCaptureFromCurrentSpot(toID,enemyColor)){
                        resetSelectedSquare();
                        setSelectedSquare(toID);
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
    else if(isValidManMove(fromID,toID,isTargetSquareEmpty)){
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
     else if(isValidCapture(fromID,toID,isTargetSquareEmpty,playerColor,enemyColor)){
        capture(fromID,toID,enemyID);
        if(isManCanCaptureFromCurrentSpot(toID,enemyColor)){
            resetSelectedSquare();
            setSelectedSquare(toID);
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
//the man's logic
const isValidManMove=(fromID,toID,isTargetSquareEmpty)=>{
    const dif=parseInt(toID-fromID);
    const fromCol=((parseInt(fromID)-1)%8);
    const toCol=((parseInt(toID)-1)%8);
    const colDif=fromCol-toCol;
    const isRightDirection=isWhiteTurn?((dif===7||dif===9)):(dif===-7||dif===-9);
    if(toID>64||toID<0||!isTargetSquareEmpty)
        return false;
    if(isRightDirection){
        if((colDif===1||colDif===-1))
                return true;
    }
    return false;
    }
const isValidCapture=(fromID,toID,isTargetSquareEmpty,playerColor,enemyColor)=>{
    const from=parseInt(fromID);
    const to=parseInt(toID);
    if(toID>64||toID<0||!isTargetSquareEmpty)
        return false;
    const fromCol=parseInt((from-1)%8);
    const toCol=parseInt((to-1)%8);
    const colDif=fromCol>toCol?fromCol-toCol:toCol-fromCol;
    const fromRow=parseInt((from-1)/8);
    const toRow=parseInt((to-1)/8);
    const rowDif=fromRow>toRow?fromRow-toRow:toRow-fromRow;
     if(colDif!==2||rowDif!==2)
        return false; 
    if(enemyColor!==""&&playerColor!==enemyColor)
        return true;
    return false;
    }
    const getEnemyId=(fromID,toID)=>{
    const from=parseInt(fromID);
    const to=parseInt(toID);
    const dif=to-from;
    if(dif===14||dif===18||dif===-14||dif===-18)
        return (from+to)/2;
    else
        return null;
}
    //the king's logic
const isValidKingMove=(fromID,toID,isTargetSquareEmpty)=>{
    const fromCol=((parseInt(fromID)-1)%8);
    const toCol=((parseInt(toID)-1)%8);
    const colDif=(fromCol>toCol)?(fromCol-toCol):(toCol-fromCol);
    const fromRow=parseInt((fromID-1)/8);
    const toRow=parseInt((toID-1)/8);
    const rowDif=(fromRow>toRow)?(fromRow-toRow):(toRow-fromRow);

    if(colDif!==rowDif)return false;
    if(!isTargetSquareEmpty)return false;
    return true;
}
const isValidKingPath=(pathId,pathData)=>{
    let enemyPieceCounter=0;
    let enemyPiece=null;
    if(pathData[pathData.length-1]!=='empty') return false;
     for(let i=0;i<pathData.length-1&&(enemyPieceCounter<2);i++){
        const squareInfo=pathData[i];
        if(squareInfo==='empty')continue;
        if(squareInfo==='self')return false;
            else{
                enemyPiece=pathId[i];
                enemyPieceCounter++;
            }
    }
    if(enemyPieceCounter===0)return 'move';
    if(enemyPieceCounter===1) return enemyPiece;
    return false;
}
const getPathId=(fromID,toID)=>{
    const fromRow=parseInt((fromID-1)/8);
    const toRow=parseInt((toID-1)/8);
    const rowDif=(fromRow>toRow)?(fromRow-toRow):(toRow-fromRow);
    const dif=parseInt(toID-fromID);
    const step=parseInt(dif/rowDif);
    const fromCol=parseInt((fromID-1)%8);
    const toCol=parseInt((toID-1)%8);
    const colDif=(fromCol>toCol)?(fromCol-toCol):(toCol-fromCol);
    let pathId=[];
    if(colDif!==rowDif) return pathId;
     for(let current=parseInt(fromID)+step;;current+=step){
        pathId.push(current);
        if(current===parseInt(toID)) break;
     }
     return pathId;
}
const isManCanCaptureFromCurrentSpot=(fromID,enemyColor)=>{
    const options=[14,18,-14,-18];
    let idNumber=parseInt(fromID);
    const fromCol=parseInt((idNumber-1)%8);
    for(let option of options){
        const toID=idNumber+option;
        const midID=parseInt(idNumber+(option/2));
        const toCol=parseInt((toID-1)%8);
        const colDif=fromCol>toCol?fromCol-toCol:toCol-fromCol;
        if(toID>64||toID<0) continue;
        if(colDif!==2) continue;
        if(getSquareStatus(midID)===enemyColor&&getSquareStatus(toID)==="empty") return true;
    }
    return false;
}
const isKingCanCaptureFromCurrentSpot=(fromID,enemyColor)=>{
    let idNumber=parseInt(fromID);
    const options=[7,9,-7,-9];
    for(let option of options){
        let nextId=idNumber+option;
        let fromCol=parseInt((idNumber-1)%8);
        let foundPiece=false;
        while((nextId>0)&&(nextId<=64)){
            let toCol=parseInt((nextId-1)%8);
            let colDif=(fromCol>toCol)?(fromCol-toCol):(toCol-fromCol);
            if(colDif!==1)break;
            const nextSquare=getSquareStatus(nextId);
            if(nextSquare==='empty'){
                if(foundPiece)return true;}
            else if(nextSquare===enemyColor){
                if(foundPiece) break;
                foundPiece=true;
            }else 
                break;
            nextId+=option;
            fromCol=toCol;
        }
    }
    return false;
}
const isOneStepValid=(fromID,toID,isKing,color)=>{
    if(toID<1||toID>64)return false;
    const fromCol=((parseInt(fromID)-1)%8);
    const toCol=((parseInt(toID)-1)%8);
    const colDif=fromCol>toCol?fromCol-toCol:toCol-fromCol;
    const dif=toID-fromID;
    const isRightDirection=(color==='white')?dif>0:dif<0;
    if(colDif!==1) return false;
    if(!isKing&&!isRightDirection) return false;
    return true;
}
const isVictory=()=>{
    const playerStatus=getPlayerStatus((isWhiteTurn?"red":"white"));
    if(playerStatus.numberOfPieces===0)
        return true;
    if(playerStatus.canMove===false && playerStatus.canCapture.length===0)
        return true;
    return false;
}