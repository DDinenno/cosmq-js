"use strict";

exports.__esModule = true;

const conditionalExpressions = [
  "IF", "ELSEIF", "ELSE"
 ]
   
 
 function isConditionExpression(node)  {
   
   if(!node.expression) return false;
 
   const isIdentifier = node.expression.type === "Identifier";
   const isCallExp = node.expression.type === "CallExpression";
   
   if(isIdentifier || isCallExp ){
     if(!node.expression.callee || !node.expression.callee.callee) return;

     const name = node.expression.callee.callee.name;
     return conditionalExpressions.includes(name);    
   }
 }
 
 function getConditionInfo(node) {
   if(!isConditionExpression(node)) throw new Error("is not a conditional expression")
      
   const name = node.expression.callee.callee.name;
   const condition = node.expression.callee.arguments && node.expression.callee.arguments[0];
   const body = node.expression.arguments && node.expression.arguments[0]
     
   return {name,condition,body}
 }
 
 
 function getConditionalName(node) {
    if(!node.expression) return null;
 
   const isIdentifier = node.expression.type === "Identifier";
   const isCallExp = node.expression.type === "CallExpression";
 
   if(isIdentifier || isCallExp ){
     const name = isIdentifier ? node.expression.name : node.expression.callee.name
     if( !conditionalExpressions.includes(name)) throw new Error("Is not a conditional expression, found " + name)
    
     return name
   }
 }
 


exports.default = function (babel) {
  const { types: t } = babel;
  
	
  class ConditionExpression {
    if = null;
  	elseIf = [];
  	else = null;
    deps = []
  	scope = null
  
  	constructor(scope) {
    	this.scope = scope;
    }
  
  	appendObservablesToDeps(condition) {
      if(condition) {
        const { bindings } = this.scope;
        
        const searchSideForVariables = (side) => {
          if(side.type === "BinaryExpression") this.appendObservablesToDeps(side)
          if(side.type === "Identifier") {
            //if(Object.keys(bindings).includes(side.name)) {
				this.deps.push(side)
           // }
          }
        }
        
        if(condition.type === "BinaryExpression") {
          const {left, right } = condition;
          	searchSideForVariables(left)
          	searchSideForVariables(right)
        }
      
      }
      
    }
  
  	appendCondition(type,condition,body) {
      if(type === "IF") {
        if(this.if != null) throw new Error("Expecting ELSEIF or ELSE condition, found IF")
        this.if = { condition, body}
      }
      if(type === "ELSEIF") {
        if(this.if == null) throw new Error("Expecting If Condition, found ELSEIF")
        if(this.else) throw new Error("ELSEIF Condition cannot be placed after an ELSE condition")
        this.elseIf.push({ condition,body  })
      }
      if(type === "ELSE") {
        if(this.if == null) throw new Error("Expecting If Condition, found Else")
        this.else = { condition: t.booleanLiteral(true), body  }
      }    
      
      if(condition)  this.appendObservablesToDeps(condition)
      
      
    }
  
  	transform() {
      const expressions = []
      
      const mapExpression = (expression) => {
      	if(expression == null) return;
       // expressions.push(t.ifStatement(statement.condition, t.returnStatement(statement.body)))
        expressions.push(t.objectExpression([
          t.objectProperty(t.stringLiteral("condition"), t.arrowFunctionExpression(this.deps, expression.condition)),
          t.objectProperty(t.stringLiteral("body"), t.arrowFunctionExpression([], t.parenthesizedExpression(expression.body)))
        ]))
      }
      
      mapExpression(this.if)
 	    this.elseIf.forEach(mapExpression)
      mapExpression(this.else)
      
      const callee = t.memberExpression(t.identifier("PlaceholderJs"), t.identifier("conditional"));
      
      return t.JSXExpressionContainer(
        t.callExpression(callee, [
          t.arrayExpression(this.deps),
          t.arrayExpression(expressions)
        ])
      )
      
      //return t.JSXExpressionContainer(
      //  t.newExpression(t.identifier("Conditional"),[
      //    t.arrowFunctionExpression([], t.BlockStatement(expressions)),
      //    t.arrayExpression(this.deps)
      //  ])
      //)  
    }
  }
  return {
    name: "ast-transform", 
    visitor: {
      Identifier(path) {
        
        
      },
      JSXElement(path){
      	const children = []
        let currentCondition = null;
        
        const previousChildren =  path.node.children.filter(child => {
        	if(child.type === "JSXText") {
               if (child.value.replace(/\n|\r\n|\s|\t/gi, "").length === 0) {
                 return false
               }
            }
          	return true;
          })
        
      previousChildren
          .forEach((child, index) => {
            if(isConditionExpression(child)) {
              const {name,  condition, body } = getConditionInfo(child)

              if(!currentCondition) {
                 currentCondition = new ConditionExpression(path.scope)
                 currentCondition.appendCondition(name, condition, body)
              } else {
                if(name === "IF") {
                  children.push(currentCondition.transform())
                  currentCondition = new ConditionExpression(path.scope)
                  currentCondition.appendCondition(name, condition, body)
                }
                if(name === "ELSEIF")  currentCondition.appendCondition(name, condition, body);
                if(name === "ELSE") {
                  currentCondition.appendCondition(name, true, body);
                  children.push(currentCondition.transform())
                  currentCondition = null;
                }
              } 
              if(currentCondition && index === previousChildren.length - 1) {
                   children.push(currentCondition.transform())
                   currentCondition = null;
                }

            } else {
              if(currentCondition) {
                children.push(currentCondition.transform())
                currentCondition = null;
              }

              children.push(child)
            }
        })
      
        path.node.children = children
      },
      JSXExpressionContainer(path) {
        
      
        //if(isConditionalExpression) {
              //    console.log(path.node.expression);
       // } else {
  	       //path.replaceWith(path.node.expression)
        //}
      }
    }
  };
}

module.exports = exports["default"];


