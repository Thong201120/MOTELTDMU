!(() => {
    window.SelectProvince = ob => {
      var dom = document.querySelector(ob.target)
      function select(full,obj,name){
        var object = obj
        var root = document.createElement("select")
        root.style.width = "100%"
        root.style.padding = "10px"
        root.style.background = "none"
        root.style.outline = "none"
        root.style.marginTop = "10px"
        root.style.boxSizing = "border-box"
        obj.forEach((k,v) => {
          var op = document.createElement("option")
          op.innerHTML = k.name
          op.value = v
          op.setAttribute("name",name)
          root.appendChild(op)
        })
        root.addEventListener("change",e => {
          var get = obj[e.target.value]
          var getSelect = document.querySelectorAll(ob.target+" select")
          if(name == "tinh"){
            dom.appendChild(select(full,get["districts"],"huyen"))
            for(var i = 1;i < getSelect.length;i++){
              getSelect[i].remove()
            }
          } else if(name == "huyen"){
            dom.appendChild(select(full,get["wards"],"xa"))
            for(var i = 2;i < getSelect.length;i++){
              getSelect[i].remove()
            }
          } else {
            var provincial = full[getSelect[0].value]
            var districts = provincial.districts[getSelect[1].value]
            var wards = get.name;
            
            ob.on({ 
              provincial: provincial.name,
              districts: districts.name,
              wards: wards
            })
          }
        });
        return root;
      }
      fetch("local.json").then(res => res.json())
      .then(data => {
        dom.appendChild(select(data,data,"tinh"))
      })
    }
  })()