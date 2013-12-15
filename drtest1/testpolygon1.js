   var a;
   function A(){ a = 1;}
   function B(){a = a+3;}
   window.onload=function(){A();B();alert(a);}