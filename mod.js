if(!cc)
    throw "No modloder found";

var voiceActing = new function VoiceActing(){
    var modPath;
    
    this.lines = {};

    this.initialize = function(){
        modPath = simplify.getMod('voiceacting').getBaseDirectory();

        this.loadLines();

        _interceptShowMSG(_handleMessage.bind(this));
    }

    this.loadLines = function(){
        simplify.resources.loadJSON(modPath + 'fileTable.json', function(files) {
            for(var map in files){
                var file = files[map];
                this.lines[map] = {};
                for(var id in file){
                    var path = file[id];
                    this.lines[map][id] = new cc.ig.Sound(path);
                }
            }
        }.bind(this));
    }

    function _handleMessage(message){
        var map = cc.ig.getMapName();
        var id = message.data.langUid;

        if(!this.lines[map])
            return console.warn('Map not found in script: ', map);
        if(!this.lines[map][id])
            return console.warn('Line not found in script: ', map, id);

        this.lines[map][id].play();
    }

    function _interceptShowMSG(callback){
        var original = cc.ig.events.SHOW_MSG.prototype.start;
        cc.ig.events.SHOW_MSG.prototype.start = function(){
            callback.call(voiceActing, this.message);
            return original.apply(this, arguments);
        }
    }

    document.body.addEventListener('modsLoaded', this.initialize.bind(this));
}();