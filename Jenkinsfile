pipeline {
    agent any
   
    stages {
        stage ('build and push') {
            steps {
                checkout scmGit(branches: [[name: '*/main']], extensions: [], userRemoteConfigs: [[credentialsId: 'github', url: 'https://github.com/ququiz/quiz-service']])
                sh 'chmod 777 ./push.sh'
                sh './push.sh'
                sh 'docker stop ququiz-quiz && docker rm ququiz-quiz'
                sh 'docker rmi lintangbirdas/quiz-command-service:v1'
            }
        }
        stage ('docker compose up') {
            steps {
                build job: "ququiz-compose", wait: true
            }
        }
    }

}