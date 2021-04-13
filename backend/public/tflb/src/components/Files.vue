<template>
  <div>
    <ul>
        <li v-for="(value, key) in fileTree" :key="key">
          <p> <a @click="folderPath = key" v-text="key"></a></p>
          <ul v-if="Array.isArray(value)">
            <li v-for="(subValue, subKey) in value" :key="subKey" v-text="subValue"></li>
          </ul>
        </li>
    </ul>
    <hr>
    <div>
      <input type="text" v-model="newName" placeholder="FolderName"/>
      <button @click="createNewFolder(newName)">Create new Folder</button>
    </div>
    <hr>
    <div v-if="folderPath != ''">
      <p>
        Upload file to <strong>{{folderPath}}/</strong>
      </p>
      <input type="file" multiple @change=" event => filesChange(event)" />
      <p>{{files.length}} Selected</p>
      <button @click="uploadFiles" ref="fileUpload"> Upload files</button>
      <button @click="files = []">Delete all Files</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Files',
  data() {
    return{
      fileTree: {},
      folderPath: '',
      newName: '',
      files: []
    }
  },
  methods: {
    getFileList: async function() {
      const response = await fetch(`https://puckersrevenge.if-loop.mywire.org/api/files`, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        const data = await response.json()
        this.fileTree = data
    },
    createNewFolder: async function (newName) {
      console.log(newName);
      const response = await fetch(`https://puckersrevenge.if-loop.mywire.org/api/files/createFolder/${newName}`, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        const data = await response.json()

        this.$parent.error = data?.error
        this.$parent.msg = data?.msg

        this.getFileList()
    },
    uploadFiles: async function () {
      if(!(this.files.length > 0)) {
        this.$parent.error = 'If you want to Upload a file you should select a file.'
        return;
      }
      const response = await fetch(`https://puckersrevenge.if-loop.mywire.org/api/files/uploadFiles/${this.folderPath}`, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({files: this.files})
        })
        const data = await response.json()
        
        this.$parent.error = data?.error
        this.$parent.msg = data?.msg

        this.getFileList()
    },
    filesChange(event) {
      var reader = new FileReader()

      // read all files recursive to provent Reading to files at the same time
      const readFile = (index) => {
        if( index >= event.target.files.length ) return;

        reader.onload = (e) => {  
          this.files.push({
            name: event.target.files[index].name,
            data: e.target.result
          })
          readFile(index+1)
        }
        reader.readAsBinaryString(event.target.files[index])
      }
      readFile(0)
    }
  },
  async created() {
       await this.getFileList()
  }
}

</script>

<style>
li ul {
  margin-left: .8em;
}
</style>