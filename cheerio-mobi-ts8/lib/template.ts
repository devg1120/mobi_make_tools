import handlebars from 'handlebars'


export default function template(doc: any) {


  //console.log(JSON.stringify(doc, undefined,1));
  //console.log(doc );
  console.log('template !!!' );

        let source = `* template sample
name: {{name}}
age: {{age}}
`
        let template = handlebars.compile(source);
        let values = {
            name : "Satoshi Watanabe",
            age : 33
        };
        let output = template(values);
        console.log(output);

}
