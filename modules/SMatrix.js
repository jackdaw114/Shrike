// NOTE: do matrix in a single array as [a,b,c,d,e,f,g,h,i]
//
//      MATRIX = ┌ a,d,g ┐
//               │ b,e,h │
//               └ c,f,i ┘ 

const size = 9
 
export default class SMatrix{
    constructor(){
        this.matrix = [1,0,0,0,1,0,0,0,1]
    }
    transpose(){
        let temp=new Array(9);
        for(let i=0;i<size; i++){
            temp[3*(i%3) + ((i/3) | 0) ] = this.matrix[i];
        }
        return temp;
    }

    translate(x,y){
        this.matrix[6] = x;
        this.matrix[7] = y;
    }

}
