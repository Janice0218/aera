'use strict';

import Vue from 'vue';

export default class MyService {
    constructor(){
        this.resourceAll = Vue.resource('/api/courses');
        this.resourceOne = Vue.resource('/api/courses{/id}');
    }
    
    getCourses() {
        return this.resourceAll.get().then((d) => d.json());
    }

    getCourse(id) {
        return this.resourceOne.get({id}).then((d) => d.json());
    }

    putCourses(){
        return this.resource.put();
    }

    createCourse(course){
        return this.resourceAll.save(course).then((c) => c.json());
    }

    deleteCourse(course){
        return this.resourceOne.delete({id:course.id}).then((c)=>c.json());
    }
}
