AWS_CREDENTIALS_TEMPLATE_FILE="/application/getmybeats/dev/aws/aws_credentials_template"
AWS_CREDENTIALS_DIR="/root/.aws"
AWS_CREDENTIALS_FILE="/root/.aws/credentials"

cd /root
if [ ! -d "$AWS_CREDENTIALS_DIR" ]
    then
        sudo mkdir .aws
fi

sudo cd $AWS_CREDENTIALS_DIR
if [ ! -f "$AWS_CREDENTIALS_FILE" ]
    then
        echo "installing new aws credentials..."
        touch "$AWS_CREDENTIALS_FILE"
        while read line
            do
                eval echo "$line" >> "$AWS_CREDENTIALS_FILE"
            done < "$AWS_CREDENTIALS_TEMPLATE_FILE"
        echo "done"
    else
        echo "credentials are fine. nothing to do."
fi
